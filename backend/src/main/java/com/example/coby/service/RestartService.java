package com.example.coby.service;

import com.example.coby.dto.CreateRoomRequest;
import com.example.coby.entity.*;
import com.example.coby.repository.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestartService {

    private final RoomService roomService;
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<Long, RestartSession> restartSessions = new ConcurrentHashMap<>();
    private static final int VOTE_TIMEOUT_SECONDS = 10;

    /**
     * 재시작 요청 시작
     */
    @Transactional
    public void initiateRestart(Long roomId, Long initiatorId) {
        // 이미 진행 중인 투표 확인
        if (restartSessions.containsKey(roomId)) {
            throw new IllegalStateException("이미 재시작 투표가 진행 중입니다.");
        }

        // 현재 방의 모든 참가자 조회
        List<RoomUser> roomUsers = roomUserRepository.findByRoomId(roomId);

        if (roomUsers.isEmpty()) {
            throw new IllegalStateException("참가자가 없는 방입니다.");
        }

        List<Long> participantIds = roomUsers.stream()
                .map(RoomUser::getUserId)
                .toList();

        // 투표 세션 생성
        RestartSession session = new RestartSession(roomId, participantIds, initiatorId);
        restartSessions.put(roomId, session);

        // 모든 참가자에게 투표 시작 알림
        Map<String, Object> message = new HashMap<>();
        message.put("type", "RestartStarted");
        message.put("initiatorId", initiatorId);

        messagingTemplate.convertAndSend("/topic/restart/" + roomId, message);

        log.info("방 {}에 재시작 투표가 시작되었습니다. 개시자: {}", roomId, initiatorId);

        // 타임아웃 스케줄링
        scheduleTimeout(roomId);
    }

    /**
     * 투표 처리
     */
    public void processVote(Long roomId, Long userId, boolean join) {
        RestartSession session = restartSessions.get(roomId);

        if (session == null) {
            throw new IllegalStateException("진행 중인 투표가 없습니다.");
        }

        // 투표 기록
        session.addVote(userId, join);

        // 투표 브로드캐스트
        Map<String, Object> voteMessage = new HashMap<>();
        voteMessage.put("type", "Vote");
        voteMessage.put("userId", userId);
        voteMessage.put("join", join);

        messagingTemplate.convertAndSend("/topic/restart/" + roomId, voteMessage);

        log.info("사용자 {}가 투표했습니다. join={}", userId, join);

        // 모든 참가자가 투표했는지 확인
        if (session.isAllVoted()) {
            completeRestart(roomId, session);
        }
    }

    /**
     * 재시작 완료 처리
     */
    @Transactional
    public void completeRestart(Long roomId, RestartSession session) {
        try {
            boolean allAccepted = session.isAllAccepted();

            Map<String, Object> resultMessage = new HashMap<>();
            resultMessage.put("type", "RestartResult");

            if (allAccepted) {
                // 새 방 생성
                Long newRoomId = createNewRoomFromOld(roomId, session.getAcceptedUserIds());

                resultMessage.put("success", true);
                resultMessage.put("newRoomId", newRoomId);

                log.info("재시작 성공! 새 방 ID: {}", newRoomId);

                // 이전 방과 관련된 모든 정보를 안전하게 삭제
                roomService.cancelRoomExpiration(roomId);
                roomService.deleteRoom(roomId);
                log.info("이전 방 ID: {} 정보가 삭제되었습니다.", roomId);

            } else {
                // 거부자가 있는 경우
                resultMessage.put("success", false);
                resultMessage.put("newRoomId", null);

                log.info("재시작 거부됨. 거부자가 있습니다.");
            }

            messagingTemplate.convertAndSend("/topic/restart/" + roomId, resultMessage);

        } finally {
            // 세션 정리
            restartSessions.remove(roomId);
        }
    }

    /**
     * 타임아웃 스케줄링
     */
    private void scheduleTimeout(Long roomId) {
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(VOTE_TIMEOUT_SECONDS * 1000);

                RestartSession session = restartSessions.get(roomId);
                if (session != null) {
                    log.info("투표 타임아웃. 미투표자 자동 거부 처리 중...");

                    // 투표하지 않은 사람은 자동으로 거부 처리
                    session.getParticipantIds().forEach(userId -> {
                        if (!session.hasVoted(userId)) {
                            session.addVote(userId, false);
                            log.info("사용자 {} 자동 거부 처리", userId);
                        }
                    });

                    completeRestart(roomId, session);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("타임아웃 스케줄링 중 인터럽트 발생", e);
            }
        });
    }

    /**
     * 새 방 생성 (기존 RoomService 활용)
     */
    @Transactional
    public Long createNewRoomFromOld(Long oldRoomId, List<Long> acceptedUserIds) {
        // 기존 방 정보 조회
        Room oldRoom = roomService.getRoom(oldRoomId);

        if (oldRoom == null) {
            throw new IllegalStateException("기존 방을 찾을 수 없습니다.");
        }

        // 방장 찾기 (기존 방장 또는 첫 번째 수락자)
        Long hostId = acceptedUserIds.stream()
                .filter(userId -> roomService.isUserHost(oldRoomId, userId))
                .findFirst()
                .orElse(acceptedUserIds.get(0));

        // 새 방 생성 요청 객체 생성
        CreateRoomRequest createRequest = CreateRoomRequest.builder()
                .roomName(oldRoom.getRoomName() + " (재대결)")
                .difficulty(oldRoom.getDifficulty())
                .timeLimit(oldRoom.getTimeLimit())
                .maxParticipants(oldRoom.getMaxParticipants())
                .currentPart(0)
                .status(RoomStatus.WAITING)
                .isPrivate(oldRoom.isPrivate())
                .password(oldRoom.getPassword())
                .itemMode(oldRoom.isItemMode())
                .build();

        // 새 방 생성 (랜덤 문제 자동 할당됨)
        Room newRoom = roomService.createRoom(createRequest);

        log.info("새 방 생성 완료. ID: {}, 문제: {}", newRoom.getId(), newRoom.getProblem().getTitle());

        // 방장을 먼저 추가 (joinRoom은 첫 번째 참가자를 자동으로 방장으로 설정)
        roomService.joinRoom(newRoom.getId(), hostId);

        // 나머지 수락한 참가자들 추가
        for (Long userId : acceptedUserIds) {
            if (!userId.equals(hostId)) {
                roomService.joinRoom(newRoom.getId(), userId);
            }
        }

        log.info("모든 참가자가 새 방에 추가되었습니다. 총 {}명", acceptedUserIds.size());

        return newRoom.getId();
    }

    /**
     * 투표 세션 클래스
     */
    @Getter
    public static class RestartSession {
        private final Long roomId;
        private final List<Long> participantIds;
        private final Long initiatorId;
        private final Map<Long, Boolean> votes;
        private final LocalDateTime createdAt;

        public RestartSession(Long roomId, List<Long> participantIds, Long initiatorId) {
            this.roomId = roomId;
            this.participantIds = new ArrayList<>(participantIds);
            this.initiatorId = initiatorId;
            this.votes = new ConcurrentHashMap<>();
            this.createdAt = LocalDateTime.now();
        }

        public void addVote(Long userId, boolean join) {
            if (!participantIds.contains(userId)) {
                throw new IllegalArgumentException("방 참가자가 아닙니다: " + userId);
            }
            votes.put(userId, join);
        }

        public boolean hasVoted(Long userId) {
            return votes.containsKey(userId);
        }

        public boolean isAllVoted() {
            return votes.size() == participantIds.size();
        }

        public boolean isAllAccepted() {
            return votes.values().stream().allMatch(Boolean::booleanValue);
        }

        public List<Long> getAcceptedUserIds() {
            return votes.entrySet().stream()
                    .filter(Map.Entry::getValue)
                    .map(Map.Entry::getKey)
                    .toList();
        }
    }
}
