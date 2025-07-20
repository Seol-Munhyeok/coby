package com.example.coby.controller;

import com.example.coby.dto.SubmissionRequestDto;
import com.example.coby.dto.SubmissionResponseDto;
import com.example.coby.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<?> createSubmission(@RequestBody SubmissionRequestDto requestDto){
        try{
            Long submissionId = submissionService.processSubmission(
                    requestDto.getUserId(),
                    requestDto.getProblemId(),
                    requestDto.getRoomId(),
                    requestDto.getLanguage(),
                    requestDto.getSourceCode()
            );
            return ResponseEntity.ok(new SubmissionResponseDto(submissionId));
        } catch (Exception e){
            return ResponseEntity.internalServerError().body("Error processing submission: "+e.getMessage());
        }
    }
}
