package com.example.coby.dto;

public record RoomUserResponse(
        Long userId,
        String nickname,
        String tier,
        boolean isHost,
        boolean isReady) {}
