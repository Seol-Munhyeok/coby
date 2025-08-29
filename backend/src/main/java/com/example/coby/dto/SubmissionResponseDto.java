package com.example.coby.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class SubmissionResponseDto {
    private Long submissionId;
    private String status;
    private String details;
}
