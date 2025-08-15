package com.example.coby.dto;

public record RoomUserResponse(Long userId, String nickname, boolean isHost, boolean isReady) {}
