package com.example.coby.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateRoomRequest {
    private String roomName;
    private String difficulty;
    private String timeLimit;
    private Integer maxParticipants;
    private Boolean isPrivate;
    private String password;
    private Boolean itemMode;
    private LocalDateTime startAt;
    private LocalDateTime expireAt;
}
