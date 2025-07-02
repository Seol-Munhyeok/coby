package com.example.coby.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OAuthUserDto(
        String nickname,
        String email,
        String provider,
        String providerId
) {}
