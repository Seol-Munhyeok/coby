package com.example.coby.dto;


import com.fasterxml.jackson.annotation.JsonProperty;

public record JudgeResultDto(
        String result,
        @JsonProperty("avg_time") String avgTime,
        @JsonProperty("avg_memory") String avgMemory
) {}

