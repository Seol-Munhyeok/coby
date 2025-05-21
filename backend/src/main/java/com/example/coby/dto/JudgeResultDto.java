package com.example.coby.dto;


public record JudgeResultDto(
        String stdout,
        String stderr,
        int exitCode
) {}

