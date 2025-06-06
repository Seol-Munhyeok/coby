package com.example.coby.service;

import com.example.coby.dto.JudgeResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class JudgeService {

    private static final Map<String, String> EXTENSIONS = Map.of(
            "java", "java",
            "cpp", "cpp",
            "python", "py"
    );

    private final RestTemplate restTemplate;

    public JudgeResultDto judgeCode(String code, String language) {
        String ext = EXTENSIONS.get(language);
        if (ext == null) throw new IllegalArgumentException("지원하지 않는 언어입니다.");

        // 1. 임시 파일 생성
        String filename = "Main." + ext;
        Path tempDir;
        try {
            tempDir = Files.createTempDirectory("submission_");
            Path filePath = tempDir.resolve(filename);
            Files.writeString(filePath, code, StandardCharsets.UTF_8);

            // 2. 채점 서버에 전송
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("code", new FileSystemResource(filePath));
            body.add("testcase", new FileSystemResource("backend/src/main/java/com/example/coby/service/testcase.txt"));
            body.add("result", new FileSystemResource("backend/src/main/java/com/example/coby/service/result.txt"));
            body.add("language", language);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<JudgeResultDto> response = restTemplate.postForEntity(
                    "http://localhost:8000/compile", // 채점 서버 주소
                    requestEntity,
                    JudgeResultDto.class
            );
            log.info("response: " + response.getBody());
            return response.getBody();

        } catch (IOException e) {
            throw new RuntimeException("파일 생성 오류", e);
        }
    }
}
