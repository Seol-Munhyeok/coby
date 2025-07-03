package com.example.coby.dto;

import com.example.coby.entity.Room;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record RoomResponse(
        Long id,
        String title,
        int maxCapacity,
        int currentCapacity,
        String language,
        LocalDateTime createdAt,
        int status
) {
    public static RoomResponse from(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .title(room.getTitle())
                .maxCapacity(room.getMaxCapacity())
                .currentCapacity(room.getCurrentCapacity())
                .language(room.getLanguage())
                .createdAt(room.getCreatedAt())
                .status(room.getStatus())
                .build();
    }
}
