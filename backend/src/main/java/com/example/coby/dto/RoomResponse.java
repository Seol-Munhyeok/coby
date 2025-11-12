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
    /**
     * Create a RoomResponse DTO from a Room entity.
     *
     * <p>Computed fields:
     * <ul>
     *   <li>`timeLimitSeconds` — the non-negative number of seconds between the Room's `startAt` and `expireAt` when both are present; `null` otherwise.</li>
     *   <li>`serverCurrentTime` — the current UTC time at construction.</li>
     *   <li>`hostName` — not populated by this overload (will be `null`).</li>
     * </ul>
     *
     * @param room the source Room entity to convert
     * @return a RoomResponse populated from the given Room
     */
    public static RoomResponse from(Room room) {
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
                .build();
    }
    /**
     * Create a RoomResponse DTO from a Room entity and an explicit host name.
     *
     * @param room the Room entity to convert into the response
     * @param hostName the host's name to include in the response
     * @return a RoomResponse populated from the given room and hostName; `serverCurrentTime` is set to the current UTC time and `timeLimitSeconds` is computed from `startAt`/`expireAt` when both are present and non-negative
     */
    public static RoomResponse from(Room room,String hostName) {
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