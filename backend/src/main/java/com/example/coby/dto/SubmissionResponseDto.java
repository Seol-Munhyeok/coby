package com.example.coby.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubmissionResponseDto {

    @JsonProperty("submission_id")
    private Long submissionId;

    @JsonProperty("result")
    private String status;
    private String details;
}
