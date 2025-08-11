package com.example.coby.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JudgeRequest {
    private Long submission_id;
    private Long problem_id;
    private String language;
    private String source_path;
    public JudgeRequest() {}

    public JudgeRequest(Long submissionId, Long problemId, String language, String sourcePath) {
        this.submission_id = submissionId;
        this.problem_id = problemId;
        this.language = language;
        this.source_path = sourcePath;
    }
}
