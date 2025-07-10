package com.example.coby.dto;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonInclude;

@Builder // 빌더 패턴을 사용하여 객체 생성
@JsonInclude(JsonInclude.Include.NON_NULL) // NULL 값 필드는 JSON에 포함하지 않음
public record JoinRoomMessage(
        String type,    // "join_room"
        String roomId,
        String userId
) {}
