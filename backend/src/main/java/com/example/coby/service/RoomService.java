package com.example.coby.service;

import com.example.coby.dto.CreateRoomRequest;
import com.example.coby.entity.Room;
import com.example.coby.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public List<Room> getRooms() {
        return roomRepository.findAll();
    }

    public Room getRoom(Long id) {
        return roomRepository.findById(id).orElse(null);
    }

    public Room createRoom(CreateRoomRequest req) {
        System.out.println("🔥 방 생성 요청 들어옴");
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

    public Room joinRoom(Long roomId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return null;
        if (room.getCurrentPart() < room.getMaxParticipants()) {
            room.setCurrentPart(room.getCurrentPart() + 1);
            roomRepository.save(room);
        }
        return room;
    }
}