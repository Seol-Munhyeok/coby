package com.example.coby.dto;

public record UserProfileResponse(
        Long id,
        String nickname,
        String preferredLanguage,
        String providerId,
        String ssoProvider
) {}
