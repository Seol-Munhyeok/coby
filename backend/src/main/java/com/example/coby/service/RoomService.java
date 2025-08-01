package com.example.coby.service;

import com.example.coby.dto.CreateRoomRequest;
import com.example.coby.dto.RoomUserResponse;
import com.example.coby.entity.Room;
import com.example.coby.entity.RoomUser;
import com.example.coby.entity.RoomUserId;
import com.example.coby.entity.User;
import com.example.coby.repository.RoomRepository;
import com.example.coby.repository.RoomUserRepository;
import com.example.coby.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final UserRepository userRepository;

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

    public Room joinRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return null;

        if (room.getCurrentPart() < room.getMaxParticipants()) {
            room.setCurrentPart(room.getCurrentPart() + 1);
            roomRepository.save(room);

            boolean isHost = roomUserRepository.findByRoomId(roomId).isEmpty();
            RoomUser roomUser = RoomUser.builder()
                    .roomId(roomId)
                    .userId(userId)
                    .isHost(isHost)
                    .build();
            roomUserRepository.save(roomUser);
        }

        return room;
    }

    public Room leaveRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return null;

        if (room.getCurrentPart() > 0) {
            room.setCurrentPart(room.getCurrentPart() - 1);
            roomRepository.save(room);

            roomUserRepository.deleteById(new RoomUserId(roomId, userId));
        }

        return room;
    }

    public List<RoomUserResponse> getRoomUsers(Long roomId) {
        return roomUserRepository.findByRoomId(roomId).stream()
                .map(ru -> {
                    User user = userRepository.findById(ru.getUserId()).orElse(null);
                    String nickname = user != null ? user.getNickname() : "";
                    return new RoomUserResponse(ru.getUserId(), nickname, ru.isHost());
                })
                .toList();
    }


    public boolean verifyPassword(Long roomId, String password) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return false;
        if (!room.isPrivate()) return true;
        return room.getPassword() != null && room.getPassword().equals(password);
    }

    // --- STOMP 채팅 기능을 위한 유틸 메소드 ---
    public void addUserToRoom(String userId, String roomId) {
        try {
            Long uid = Long.parseLong(userId);
            Long rid = Long.parseLong(roomId);
            joinRoom(rid, uid);
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