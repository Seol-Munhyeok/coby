package com.example.coby.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoomResultDto(
        Long roomId,
        Long userId,
        Long submissionId,
        String nickname,
        LocalDateTime finishedAt
) {}
