package com.example.coby.service;

import com.example.coby.dto.CreateRoomRequest;
import com.example.coby.dto.RoomUserResponse;
import com.example.coby.entity.*;
import com.example.coby.repository.ProblemRepository;
import com.example.coby.repository.RoomRepository;
import com.example.coby.repository.RoomUserRepository;
import com.example.coby.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Random;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;

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
        return roomRepository.save(room);
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
        return roomRepository.save(room);
    }

    @Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 성능 최적화
    public Problem getRoomProblem(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
        return room.getProblem();
    }

    @Transactional
    public Room joinRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return null;

        RoomUserId id = new RoomUserId(roomId, userId);
        if (roomUserRepository.existsById(id)) {
            return room;
        }

        if (room.getCurrentPart() < room.getMaxParticipants()) {
            RoomUser roomUser = RoomUser.builder()
                    .roomId(roomId)
                    .userId(userId)
                    .isHost(roomUserRepository.findByRoomId(roomId).isEmpty())
                    .isReady(false)
                    .build();
            roomUserRepository.save(roomUser);

            // Room_user 테이블의 실제 레코드 수를 기반으로 current_part 업데이트
            long newCount = roomUserRepository.countByRoomId(roomId);
            room.setCurrentPart((int) newCount);
            roomRepository.save(room);
        }

        return room;
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

    public void removeUserFromRoom(String userId, String roomId) {
        try {
            Long rid = Long.parseLong(roomId);
            Long uid = Long.parseLong(userId);
            leaveRoom(rid, uid);
        } catch (NumberFormatException e) {
            log.warn("올바르지 않은 ID: userId={}, roomId={}", userId, roomId);
        }
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
}