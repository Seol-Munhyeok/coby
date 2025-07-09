package com.example.coby.dto;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoomParticipantsMessage(
        String type,        // "room_participants"
        String roomId,
        List<RoomParticipant> participants // 참여자 목록
) {}