package com.example.coby.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record WsMessageDto(
        String type,  // Chat, CurrentUsers, Join, Leave
        String roomId,
        String userId,
        String nickname,
        String profileUrl,
        Boolean isReady,
        String content,
        List<RoomUserResponse> users
) {}
