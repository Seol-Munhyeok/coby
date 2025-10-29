package com.example.coby.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class UserRoomResultDto {
    private String roomName;
    private boolean isWinner; // true: 승리, false: 패배
    private LocalDateTime createdAt;
}
