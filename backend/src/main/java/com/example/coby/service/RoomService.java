package com.example.coby.service;

import com.example.coby.dto.CreateRoomRequest;
import com.example.coby.entity.Problem;
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
        Room room = Room.builder()
                .title(req.getTitle())
                .maxCapacity(req.getMaxCapacity())
                .currentCapacity(0)
                .language(req.getLanguage())
                .createdAt(LocalDateTime.now())
                .status(0)
                .build();
        if (req.getProblemId() != null) {
            Problem problem = new Problem();
            problem.setId(req.getProblemId());
            room.setProblem(problem);
        }
        return roomRepository.save(room);
    }

    public Room joinRoom(Long roomId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return null;
        if (room.getCurrentCapacity() < room.getMaxCapacity()) {
            room.setCurrentCapacity(room.getCurrentCapacity() + 1);
            roomRepository.save(room);
        }
        return room;
    }
}