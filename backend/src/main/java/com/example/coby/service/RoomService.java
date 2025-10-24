package com.example.coby.service;

import com.example.coby.dto.*;
import com.example.coby.entity.*;
import com.example.coby.repository.*;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.*;

import java.time.LocalDateTime;
import java.util.concurrent.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private static final long ROOM_DELETION_DELAY_SECONDS = 5L;
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final TierRepository tierRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final TransactionTemplate transactionTemplate;

    private final ScheduledExecutorService roomDeletionScheduler = Executors.newSingleThreadScheduledExecutor();
    private final Map<Long, ScheduledFuture<?>> pendingRoomDeletionTasks = new ConcurrentHashMap<>();

    public List<Room> getRooms() {
        return roomRepository.findAll();
    }

    public Room getRoom(Long id) {
        return roomRepository.findById(id).orElse(null);
    }

    @Transactional
    public Room createRoom(CreateRoomRequest req) {
        // 1. 모든 문제 목록을 가져와서 랜덤으로 하나를 선택합니다.
        List<Problem> problems = problemRepository.findAll();
        if (problems.isEmpty()) {
            throw new IllegalStateException("문제 데이터가 없습니다.");
        }
        Problem selectedProblem = problems.get(new Random().nextInt(problems.size()));

        // 2. Room을 빌드할 때 선택된 문제를 할당합니다.
        Room room = Room.builder()
                .roomName(req.getRoomName())
                .difficulty(req.getDifficulty())
                .timeLimit(req.getTimeLimit())
                .maxParticipants(req.getMaxParticipants())
                .currentPart(req.getCurrentPart())
                .status(req.getStatus())
                .isPrivate(req.isPrivate())
                .password(req.getPassword())
                .itemMode(req.isItemMode())
                .currentCapacity(0)
                .maxCapacity(req.getMaxParticipants())
                .problem(selectedProblem) // ✨ 여기에서 문제를 할당
                .build();
        Room savedRoom = roomRepository.save(room);
        broadcastRoomList();
        return savedRoom;
    }

    @Transactional
    public Room changeRoomProblem(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));

        Problem currentProblem = room.getProblem();

        // 현재 문제와 다른 새로운 문제를 찾기
        List<Problem> allProblems = problemRepository.findAll();
        if (allProblems.size() <= 1) {
            // 문제가 1개 이하일 경우 변경 불가
            log.warn("문제 DB에 문제 수가 부족하여 문제를 변경할 수 없습니다.");
            return room;
        }

        Problem newProblem;
        do {
            newProblem = allProblems.get(new Random().nextInt(allProblems.size()));
        } while (newProblem.equals(currentProblem)); // 현재 문제와 동일하면 다시 찾기

        room.setProblem(newProblem);
        Room updatedRoom = roomRepository.save(room);
        broadcastRoomList();
        return updatedRoom;
    }

    @Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 성능 최적화
    public Problem getRoomProblem(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
        return room.getProblem();
    }


    public Room joinRoom(Long roomId, Long userId) {
        Room result = transactionTemplate.execute(status -> {
            Room room = roomRepository.findById(roomId).orElse(null);
            if (room == null) return null;

            RoomUserId id = new RoomUserId(roomId, userId);
            if (roomUserRepository.existsById(id)) {
                // 이미 방에 있는 경우에도 삭제예약은 커밋 이후 취소
                org.springframework.transaction.support.TransactionSynchronizationManager
                        .registerSynchronization(new org.springframework.transaction.support.TransactionSynchronization() {
                            @Override public void afterCommit() {
                                cancelScheduledRoomDeletion(roomId);
                            }
                        });
                return room;
            }

            if (room.getCurrentPart() < room.getMaxParticipants()) {
                // 호스트 판단은 DB 카운트 기반
                boolean isFirst = roomUserRepository.countByRoomId(roomId) == 0;

                RoomUser roomUser = RoomUser.builder()
                        .roomId(roomId)
                        .userId(userId)
                        .isHost(isFirst)
                        .isReady(false)
                        .build();
                roomUserRepository.save(roomUser);

                long newCount = roomUserRepository.countByRoomId(roomId);
                room.setCurrentPart((int) newCount);
                roomRepository.save(room);

                // 예약취소는 커밋 이후 실행 (부분실패/롤백 시 부작용 방지)
                org.springframework.transaction.support.TransactionSynchronizationManager
                        .registerSynchronization(new org.springframework.transaction.support.TransactionSynchronization() {
                            @Override public void afterCommit() {
                                cancelScheduledRoomDeletion(roomId);
                            }
                        });
            }

            return room;
        });

        if (result != null) {
            broadcastRoomList();
        }

        return result;
    }


    @Transactional
    public void startGame(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("게임을 시작할 방을 찾을 수 없습니다."));

        room.setStatus(RoomStatus.IN_PROGRESS);

        roomRepository.save(room);

        broadcastRoomList();

        log.info("방 {}의 게임 상태가 IN_PROGRESS로 변경되었습니다. (방 삭제 방어 활성화)", roomId);
    }

    @Transactional
    public Room leaveRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return null;

        RoomUserId id = new RoomUserId(roomId, userId);
        if (roomUserRepository.existsById(id)) {
            roomUserRepository.deleteById(id);

            // Room_user 테이블의 실제 레코드 수를 기반으로 current_part 업데이트
            long newCount = roomUserRepository.countByRoomId(roomId);
            room.setCurrentPart((int) newCount);
            roomRepository.save(room);
        }

        broadcastRoomList();

        return room;
    }

    @Transactional(readOnly = true)
    public Optional<RoomHostResponse> getRoomHost(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            return Optional.empty();
        }

        return roomUserRepository.findByRoomIdAndIsHostTrue(roomId)
                .flatMap(roomUser -> userRepository.findById(roomUser.getUserId())
                        .map(user -> new RoomHostResponse(
                                user.getId(),
                                user.getNickname(),
                                user.getEmail(),
                                roomUser.isHost())));
    }

    public List<RoomUserResponse> getRoomUsers(Long roomId) {
        return roomUserRepository.findByRoomId(roomId).stream()
                .map(ru -> {
                    User user = userRepository.findById(ru.getUserId()).orElse(null);
                    String nickname = user != null ? user.getNickname() : "";
                    return new RoomUserResponse(ru.getUserId(), nickname, ru.isHost(), ru.isReady());
                })
                .toList();
    }


    public boolean verifyPassword(Long roomId, String password) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return false;
        if (!room.isPrivate()) return true;
        return room.getPassword() != null && room.getPassword().equals(password);
    }


    public void addUserToRoom(String userId, String roomId) {
        try {
            Long uid = Long.parseLong(userId);
            Long rid = Long.parseLong(roomId);
            Room room = joinRoom(rid, uid);
            if (room != null) {
                long newCount = roomUserRepository.countByRoomId(rid);
                room.setCurrentPart((int) newCount);
                roomRepository.save(room);
                cancelScheduledRoomDeletion(rid);
            }
        } catch (NumberFormatException e) {
            log.warn("올바르지 않은 사용자 ID 또는 방 ID: userId={}, roomId={}", userId, roomId);
        }
    }

    public List<String> getUsersInRoom(String roomId) {
        try {
            Long rid = Long.parseLong(roomId);
            return getRoomUsers(rid).stream()
                    .map(RoomUserResponse::nickname)
                    .toList();
        } catch (NumberFormatException e) {
            log.warn("올바르지 않은 방 ID: {}", roomId);
            return List.of();
        }
    }

    @Transactional
    public void updateReadyStatus(Long userId, Long roomId, boolean isReady) {
        RoomUserId id = new RoomUserId(roomId, userId);
        roomUserRepository.findById(id).ifPresent(ru -> {
            ru.setReady(isReady);
            roomUserRepository.save(ru);
        });
    }

    public boolean isUserInRoom(String roomId, String userId) {
        try {
            Long rid = Long.parseLong(roomId);
            Long uid = Long.parseLong(userId);
            return roomUserRepository.existsById(new RoomUserId(rid, uid));
        } catch (NumberFormatException e) {
            log.warn("올바르지 않은 ID: userId={}, roomId={}", userId, roomId);
            return false;
        }
    }

    public void deleteRoom(Long roomId) {
        cancelScheduledRoomDeletion(roomId);
        transactionTemplate.executeWithoutResult(status -> {
            // 1. 이 방을 참조하는 모든 Submission을 찾습니다.
            List<Submission> submissions = submissionRepository.findAllByRoomId(roomId);

            // 2. 각 Submission의 room 참조를 null로 설정하여 연관 관계를 끊습니다.
            for (Submission submission : submissions) {
                submission.setRoom(null);
            }
            submissionRepository.saveAll(submissions); // 변경된 내용 저장

            // 3. 이 방에 속한 모든 RoomUser를 삭제합니다.
            roomUserRepository.deleteAllByRoomId(roomId);

            // 4. 연관 관계가 끊어졌으므로 방을 안전하게 삭제합니다.
            roomRepository.deleteById(roomId);
        });

        broadcastRoomList();
    }

    @Transactional
    public void removeUserFromRoom(String userId, String roomId) {
        try {
            Long rid = Long.parseLong(roomId);
            Long uid = Long.parseLong(userId);

            leaveRoom(rid, uid);

            Room room = roomRepository.findById(rid).orElse(null);

            // 게임 진행 중이었는지 확인
            boolean wasGameInProgress = room.getStatus() == RoomStatus.IN_PROGRESS;

            // --- 게임 중 이탈(패배) 처리 ---
            if (wasGameInProgress) {
                // 게임 중에 나갔으므로, 나간 유저는 패배 처리
                handleGameLoss(uid);

                // --- 마지막 생존자(승리) 처리 ---
                // 방이 삭제되지 않았고 (updatedRoom != null)
                // 유저가 나간 후, 남은 인원이 1명이라면 그 1명이 승리
                if (room != null && room.getCurrentPart() == 1) {
                    log.info("방 {}에서 유저 {}가 이탈하여, 마지막 생존자 승리 로직을 실행합니다.", rid, uid);
                    // finishRoomByLastManStanding은 내부적으로 status를 IN_PROGRESS에서 RESULT로 바꿈
                    finishRoomByLastManStanding(rid);
                }
            }

            // leaveRoom 후에도 room이 여전히 존재하고, 현재 인원이 0인지 확인
            if (room != null) {
                if (room.getCurrentPart() == 0) {
                    scheduleRoomDeletionIfEmpty(rid);
                } else {
                    cancelScheduledRoomDeletion(rid);
                }
            }

        } catch (NumberFormatException e) {
            log.warn("올바르지 않은 ID: userId={}, roomId={}", userId, roomId);
        }
    }

    /**
     * 게임 중 이탈한 사용자의 패배를 처리합니다.
     * (총 게임 수 + 1, 승리 수는 변동 없음)
     * 별도 트랜잭션(REQUIRES_NEW)으로 분리하여 이 로직이 실패해도 방 나가기 처리는 롤백되지 않도록 합니다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleGameLoss(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                user.incrementTotalGame(); // 총 게임 수 1 증가
                // 승리(winGame)는 증가시키지 않음 (즉, 1패)
                userRepository.save(user);
                log.info("유저 {}가 게임 중 이탈하여 패배 처리되었습니다.", userId);
            } else {
                log.warn("패배 처리할 유저 {}를 찾을 수 없습니다.", userId);
            }
        } catch (Exception e) {
            log.error("유저 {} 패배 처리 중 예외 발생", userId, e);
        }
    }

    /**
     * 게임 중 다른 유저가 모두 나가서, 마지막 1명이 남았을 때 호출됩니다.
     * 마지막 1명을 승자로 처리하고 방을 종료시킵니다.
     */
    @Transactional
    public void finishRoomByLastManStanding(Long roomId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        // 방이 없거나, 이미 게임 중이 아니면 처리 중단
        if (room == null || room.getStatus() != RoomStatus.IN_PROGRESS) {
            log.warn("게임 중이 아닌 방 {} 의 마지막 생존자 승리 처리를 시도했습니다.", roomId);
            return;
        }

        // 1. 마지막 생존자(승자) ID 찾기
        Long winnerUserId = findFirstUserId(roomId);
        if (winnerUserId == null) {
            // 이 시점에 1명은 있어야 함. 0명이라면 removeUserFromRoom에서 0명 처리가 되어야 함.
            log.warn("마지막 생존자 승리 처리 중 유저를 찾을 수 없음. 방 {} 상태를 WAITING으로 변경", roomId);
            room.setStatus(RoomStatus.WAITING);
            roomRepository.save(room);
            broadcastRoomList();
            return;
        }

        // 2. 방 상태 업데이트 (승자 Submission ID는 null)
        // 기존 finishRoom과 달리 승자 Submission이 없으므로 winnerId (Submission ID)에 null 전달
        roomRepository.updateWinnerAndFinish(roomId, null, LocalDateTime.now(), RoomStatus.RESULT);

        // 3. 승자 스탯 업데이트 (이 시점에 방에는 승자만 남아있음)
        User winnerUser = userRepository.findById(winnerUserId)
                .orElseThrow(() -> new IllegalStateException("승자 유저를 찾을 수 없습니다: " + winnerUserId));

        winnerUser.incrementTotalGame(); // 총 게임 수 증가
        winnerUser.incrementWinGame();   // 승리 수 증가
        winnerUser.addTierPoints(200);   // 티어 포인트 증가 (기존 finishRoom과 동일하게 200점)

        Tier resolvedTier = resolveTier(winnerUser.getTierPoint());
        if (resolvedTier != null) {
            winnerUser.setTier(resolvedTier);
        }
        userRepository.save(winnerUser);

        log.info("방 {}의 마지막 생존자 {}가 승리했습니다.", roomId, winnerUserId);

        // 4. 방 목록 갱신
        broadcastRoomList();

        // 5. [추가된 부분] 방 참여자들에게 게임 종료 및 결과 페이지 이동 알림
        WsMessageDto gameEndNotice = WsMessageDto.builder()
                .type("GameEnd") // 프론트엔드에서 이 타입을 감지해야 함
                .roomId(String.valueOf(roomId))
                .userId(String.valueOf(winnerUserId)) // 승리한 유저 ID
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId, gameEndNotice);
        log.info("방 {} 참여자들에게 GameEnd 메시지 전송 (승자: {})", roomId, winnerUserId);
    }

    private void scheduleRoomDeletionIfEmpty(Long roomId) {
        ScheduledFuture<?> existingTask = pendingRoomDeletionTasks.remove(roomId);
        if (existingTask != null) {
            existingTask.cancel(false);
        }

        ScheduledFuture<?> future = roomDeletionScheduler.schedule(() -> {
            try {
                Room latestRoom = roomRepository.findById(roomId).orElse(null);
                if (latestRoom != null && latestRoom.getCurrentPart() == 0) {
                    deleteRoom(roomId);
                }
            } finally {
                pendingRoomDeletionTasks.remove(roomId);
            }
        }, ROOM_DELETION_DELAY_SECONDS, TimeUnit.SECONDS);

        pendingRoomDeletionTasks.put(roomId, future);
    }

    private void cancelScheduledRoomDeletion(Long roomId) {
        ScheduledFuture<?> scheduledFuture = pendingRoomDeletionTasks.remove(roomId);
        if (scheduledFuture != null) {
            scheduledFuture.cancel(false);
        }
    }

    @PreDestroy
    public void shutdownScheduler() {
        roomDeletionScheduler.shutdownNow();
    }


    @Transactional
    public void delegateHost(Long roomId, Long newHostId) {
        List<RoomUser> roomUsers = roomUserRepository.findByRoomId(roomId);
        for (RoomUser ru : roomUsers) {
            ru.setHost(ru.getUserId().equals(newHostId));
            roomUserRepository.save(ru);
        }
    }

    public boolean isUserHost(Long roomId, Long userId) {
        return roomUserRepository.findById(new RoomUserId(roomId, userId))
                .map(RoomUser::isHost)
                .orElse(false);
    }

    public Long findFirstUserId(Long roomId) {
        return roomUserRepository.findByRoomId(roomId).stream()
                .findFirst()
                .map(RoomUser::getUserId)
                .orElse(null);
    }

    @Transactional
    public void finishRoom(Long roomId, Long winId) {
        roomRepository.updateWinnerAndFinish(roomId, winId, LocalDateTime.now(), RoomStatus.RESULT);

        // winId에서 승리자의 userId를 가져옴
        Submission winningSubmission = submissionRepository.findById(winId)
                .orElseThrow(() -> new IllegalArgumentException("제출 기록을 찾을 수 없습니다: " + winId));
        Long winnerUserId = winningSubmission.getUser().getId();

        // roomId에 해당하는 room의 참가자를 가져옴
        List<RoomUser> participants = roomUserRepository.findByRoomId(roomId);
        Set<Long> participantIds = participants.stream()
                .map(RoomUser::getUserId)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Map<Long, User> usersById = userRepository.findAllById(participantIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        participantIds.forEach(participantId -> {
            User user = usersById.get(participantId);
            if (user == null) {
                log.warn("방 참가자를 찾을 수 없습니다. roomId={}, userId={}", roomId, participantId);
                return;
            }

            user.incrementTotalGame();

            if (participantId.equals(winnerUserId)) {
                user.incrementWinGame();
                user.addTierPoints(200);
                Tier resolvedTier = resolveTier(user.getTierPoint());
                if (resolvedTier != null) {
                    user.setTier(resolvedTier);
                }
            }
        });

        userRepository.saveAll(usersById.values());

        broadcastRoomList();
    }

    private Tier resolveTier(int tierPoint) {
        return tierRepository
                .findFirstByPointMinLessThanEqualAndPointMaxGreaterThanEqual(tierPoint, tierPoint)
                .or(() -> tierRepository.findFirstByPointMinLessThanEqualOrderByPointMinDesc(tierPoint))
                .orElseGet(() -> {
                    log.warn("티어 정보를 찾을 수 없습니다: tierPoint={}", tierPoint);
                    return null;
                });
    }

    private void broadcastRoomList() {
        List<RoomResponse> responses = roomRepository.findAll().stream()
                .map(RoomResponse::from)
                .toList();
        messagingTemplate.convertAndSend("/topic/room-data", responses);
    }
}