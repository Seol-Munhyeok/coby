package com.example.coby.dto;

import com.example.coby.entity.RoomStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CreateRoomRequest {
    private String roomName;
    private String difficulty;
    private String timeLimit;
    private int maxParticipants;
    private int currentPart;
    private RoomStatus status;
    private boolean isPrivate;
    private String password;
    private boolean itemMode;
    private LocalDateTime startAt;
    private LocalDateTime expireAt;
}