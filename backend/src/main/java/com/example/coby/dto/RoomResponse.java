package com.example.coby.dto;

import com.example.coby.entity.Room;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record RoomResponse(
        Long id,
        String roomName,
        int maxParticipants,
        int currentPart,
        String difficulty,
        String timeLimit,
        boolean isPrivate,
        boolean itemMode,
        LocalDateTime createdAt,
        int status
) {
    public static RoomResponse from(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .roomName(room.getRoomName())
                .maxParticipants(room.getMaxParticipants())
                .currentPart(room.getCurrentPart())
                .difficulty(room.getDifficulty())
                .timeLimit(room.getTimeLimit())
                .isPrivate(room.isPrivate())
                .itemMode(room.isItemMode())
                .createdAt(room.getCreatedAt())
                .status(room.getStatus())
                .build();
    }
}