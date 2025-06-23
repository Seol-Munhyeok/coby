package com.example.coby.service;

import com.example.coby.dto.JudgeResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

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

    private final WebClient webClient;

    public JudgeResultDto judgeCode(String code, String language) {
        String ext = EXTENSIONS.get(language);
        if (ext == null) throw new IllegalArgumentException("지원하지 않는 언어입니다.");

        // 1. 임시 파일 생성
        String filename = "Main." + ext;

        try {
            Path tempDir = Files.createTempDirectory("submission_");
            Path filePath = tempDir.resolve(filename);
            Files.writeString(filePath, code, StandardCharsets.UTF_8);

            // 2. 리소스 파일 불러오기
            ClassPathResource testcase = new ClassPathResource("testcase.txt");
            ClassPathResource result = new ClassPathResource("result.txt");

            // 3. Multipart 전송 데이터 구성
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("code", new FileSystemResource(filePath));
            builder.part("testcase", testcase);
            builder.part("result", result);
            builder.part("language", language);

            // 4. WebClient 요청 (동기적 처리)
            JudgeResultDto response = webClient.post()
                    .uri("http://localhost:8000/compile")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(JudgeResultDto.class)
                    .block();  // 동기 처리

            log.info("Judge server response: {}", response);
            return response;

        } catch (IOException e) {
            throw new RuntimeException("파일 생성 오류", e);
        }
    }
}
