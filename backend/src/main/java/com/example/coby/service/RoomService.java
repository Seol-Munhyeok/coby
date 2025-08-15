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

    public Room createRoom(CreateRoomRequest req) {
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
                .build();
        return roomRepository.save(room);
    }

    @Transactional
    public Problem getRoomProblem(Long roomId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) {
            return null;
        }
        if (room.getProblem() != null) {
            return room.getProblem();
        }
        List<Problem> problems = problemRepository.findAll();
        if (problems.isEmpty()) {
            return null;
        }
        Problem randomProblem = problems.get((int) (Math.random() * problems.size()));
        room.setProblem(randomProblem);
        roomRepository.save(room);
        return randomProblem;
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
}