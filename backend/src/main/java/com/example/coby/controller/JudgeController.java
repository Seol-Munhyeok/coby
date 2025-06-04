package com.example.coby.controller;

import ch.qos.logback.classic.Logger;
import com.example.coby.dto.CodeRequestDto;
import com.example.coby.dto.JudgeResultDto;
import com.example.coby.service.JudgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JudgeController {

    private final JudgeService judgeService;

    @PostMapping("/submit")
    public ResponseEntity<JudgeResultDto> submitCode(
            @RequestBody CodeRequestDto request
    ) {
        try{
            String code = request.getCode();
            String language = request.getLanguage();

            JudgeResultDto result = judgeService.judgeCode(code, language);
            return ResponseEntity.ok(result);
        } catch(Exception e) {
            log.info("Wrong params");
            log.info(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}