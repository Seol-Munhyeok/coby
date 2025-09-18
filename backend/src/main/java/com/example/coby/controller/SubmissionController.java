package com.example.coby.controller;

import com.example.coby.dto.JudgeRequest;
import com.example.coby.dto.SubmissionRequestDto;
import com.example.coby.dto.SubmissionResponseDto;
import com.example.coby.dto.WinnerCodeDto;
import com.example.coby.service.JudgeNotificationService;
import com.example.coby.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SubmissionController {

    @Autowired
    private JudgeNotificationService judgeNotificationService;
    private final SubmissionService submissionService;

    @GetMapping("/winnercode")
    public ResponseEntity<WinnerCodeDto> winnerCode(Long Id) {
        WinnerCodeDto winnerCodeDto;
        winnerCodeDto = submissionService.getWinnerCode(Id);
        return new ResponseEntity<>(winnerCodeDto, HttpStatus.OK);
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<SubmissionResponseDto> getSubmission(@PathVariable long id) {
        SubmissionResponseDto submissionDto = submissionService.getSubmissionDtoById(id);
        return ResponseEntity.ok(submissionDto);
    }

    @PostMapping("/submissions")
    public ResponseEntity<?> createSubmission(@RequestBody SubmissionRequestDto requestDto){
        try{
            //s3에 파일저장
            String source_path = submissionService.processWrapping(
                    requestDto.getSourceCode(),
                    requestDto.getLanguage(),
                    requestDto.getUserId(),
                    requestDto.getProblemId()
            );

            //submission db에 저장
            Long submissionId = submissionService.processSubmission(
                    requestDto.getUserId(),
                    requestDto.getProblemId(),
                    requestDto.getRoomId(),
                    requestDto.getLanguage(),
                    source_path
            );

            JudgeRequest judgeRequest = new JudgeRequest(
                    submissionId,
                    requestDto.getProblemId(),
                    requestDto.getLanguage(),
                    source_path);
            //sns전송
            String messageId = judgeNotificationService.sendJudgeRequest(judgeRequest);
            System.out.println("제출 처리 완료 - submissionId = " + submissionId +
                    "Sns Message Id: " + messageId);

            // 결과 가져오기

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("submissionId", submissionId));
        } catch (Exception e){
            System.err.println("코드 제출 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error","제출처리 실패: " + e.getMessage()));
        }
    }
}
