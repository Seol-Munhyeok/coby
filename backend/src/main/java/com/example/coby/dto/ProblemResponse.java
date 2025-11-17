package com.example.coby.dto;

import com.example.coby.entity.Difficulty;
import com.example.coby.entity.Problem;

public record ProblemResponse(
        Long id,
        String title,
        String content,
        int timeLimit,
        int memoryLimit,
        String testcaseS3Path,
        String resultS3Path,
        Integer difficultyId,
        String difficultyLabel,
        Integer difficultyRewardPoint
) {
    public static ProblemResponse from(Problem problem) {
        Difficulty difficulty = problem.getDifficulty();
        return new ProblemResponse(
                problem.getId(),
                problem.getTitle(),
                problem.getContent(),
                problem.getTimeLimit(),
                problem.getMemoryLimit(),
                problem.getTestcaseS3Path(),
                problem.getResultS3Path(),
                difficulty != null ? difficulty.getId() : null,
                difficulty != null ? difficulty.getLabel() : null,
                difficulty != null ? difficulty.getRewardPoint() : null
        );
    }
}
