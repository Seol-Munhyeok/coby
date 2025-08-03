package com.example.coby.dto;

public record UserProfileResponse(
        Long id,
        String nickname,
        String email,
        String ssoProvider,
        String providerId,
        String preferredLanguage,
        Integer reportCount,
        Integer totalGame,
        Integer winGame,
        Integer tierPoint,
        String tierName,
        String tierImageUrl
) {}
