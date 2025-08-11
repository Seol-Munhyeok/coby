package com.example.coby.dto;

import com.example.coby.entity.Problem;

public record ProblemResponse(
        Long id,
        String title,
        String content,
        int timeLimit,
        int memoryLimit,
        String testcaseS3Path,
        String resultS3Path,
        Integer difficultyId
) {
    public static ProblemResponse from(Problem problem) {
        return new ProblemResponse(
                problem.getId(),
                problem.getTitle(),
                problem.getContent(),
                problem.getTimeLimit(),
                problem.getMemoryLimit(),
                problem.getTestcaseS3Path(),
                problem.getResultS3Path(),
                problem.getDifficulty() != null ? problem.getDifficulty().getId() : null
        );
    }
}
