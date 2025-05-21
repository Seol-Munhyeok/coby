package com.example.coby.controller;

import com.example.coby.dto.JudgeResultDto;
import com.example.coby.service.JudgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JudgeController {

    private final JudgeService judgeService;

    @PostMapping("/submit")
    public ResponseEntity<JudgeResultDto> submitCode(
            @RequestParam String code,
            @RequestParam String language
    ) {
        JudgeResultDto result = judgeService.judgeCode(code, language);
        return ResponseEntity.ok(result);
    }
}

