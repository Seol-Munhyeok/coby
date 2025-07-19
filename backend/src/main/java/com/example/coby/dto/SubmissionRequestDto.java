package com.example.coby.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmissionRequestDto {
    private Long userId;
    private Long problemId;
    private Long roomId;
    private String language;
    private String sourceCode;
}
