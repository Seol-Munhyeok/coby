package com.example.coby.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record WsMessageDto(
        String type,  // Chat, CurrentUsers, Join, Leave, Host
        String roomId,
        String userId,
        String nickname,
        String profileUrl,
        Boolean isReady,
        Boolean isHost,
        String content,
        Boolean isJoin,  // 재시작 투표용
        Long newRoomId,  // 새 방 ID
        Boolean success, // 재시작 성공 여부
        List<RoomUserResponse> users,
        LocalDateTime startAt,
        LocalDateTime expireAt,
        Long timeLimitSeconds,
        Long gameStartDelaySeconds

) {}
