package com.example.coby.dto;

import lombok.Data;

@Data
public class CreateRoomRequest {
    private String title;
    private int maxCapacity;
    private String language;
    private Long problemId;
}