package com.example.coby.dto;

import com.example.coby.entity.Room;
import com.example.coby.entity.RoomStatus;
import lombok.Builder;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

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
        RoomStatus status,
        String hostName,
        LocalDateTime startAt,
        LocalDateTime expireAt,
        Long timeLimitSeconds,
        LocalDateTime serverCurrentTime
) {
    public static RoomResponse from(Room room) {
        return from(room, null);
    }

    public static RoomResponse from(Room room, String hostName) {
        LocalDateTime startAt = room.getStartAt();
        LocalDateTime expireAt = room.getExpireAt();
        Long timeLimitSeconds = null;
        if (startAt != null && expireAt != null) {
            long seconds = Duration.between(startAt, expireAt).getSeconds();
            if (seconds >= 0) {
                timeLimitSeconds = seconds;
            }
        }
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
                .startAt(startAt)
                .expireAt(expireAt)
                .timeLimitSeconds(timeLimitSeconds)
                .serverCurrentTime(LocalDateTime.now(ZoneOffset.UTC))
                .hostName(hostName)
                .build();
    }
}