package com.example.coby.dto;

import lombok.Data;

@Data
public class CreateRoomRequest {
    private String roomName;
    private String difficulty;
    private String timeLimit;
    private int maxParticipants;
    private int currentPart;
    private int status;
    private boolean isPrivate;
    private String password;
    private boolean itemMode;
}