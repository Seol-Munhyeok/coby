package com.example.coby.service;

import com.example.coby.dto.CreateRoomRequest;
import com.example.coby.dto.RoomResponse;
import com.example.coby.dto.RoomUserResponse;
import com.example.coby.entity.*;
import com.example.coby.repository.*;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Map;
import java.util.Random;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.concurrent.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.LinkedHashSet;

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