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

    // 변수 이름을 'status'에서 'result'로 변경하여 JSON 키와 일치시킵니다.
    private String result;

    private String details;
    @JsonProperty("avg_time")
    private Double avgTime;

    @JsonProperty("avg_memory")
    private Double avgMemory;
}