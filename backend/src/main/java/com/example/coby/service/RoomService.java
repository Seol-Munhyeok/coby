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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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
}