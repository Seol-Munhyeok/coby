package com.example.coby.dto;

import lombok.Builder;
import lombok.With;
import com.fasterxml.jackson.annotation.JsonInclude;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@With
public record RoomParticipant(
        String userId,
        String userName,
        double progress,
        int lineCount,
        String code
) {}