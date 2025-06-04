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
            @RequestParam String language,
            @RequestParam String testcase,
            @RequestParam String result
    ) {
        JudgeResultDto resultDto = judgeService.judgeCode(code, language, testcase, result);
        return ResponseEntity.ok(resultDto);
    }
}

