package com.example.coby.service;

import com.example.coby.entity.Code;
import com.example.coby.entity.Problem;
import com.example.coby.entity.Room;
import com.example.coby.entity.User;
import com.example.coby.property.awsProperties;
import com.example.coby.repository.CodeRepository;
import com.example.coby.repository.ProblemRepository;
import com.example.coby.repository.RoomRepository;
import com.example.coby.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final S3Client s3client;
    private final ObjectMapper objectMapper;
    private final CodeRepository codeRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final RoomRepository roomRepository;
    private final awsProperties awsProperties;


    public String processWrapping(String sourceCode, Long user_id, Long problem_id) {
        String bucket = awsProperties.getS3().getBucket();
        String s3Key = String.format("submissions/%d/%d/main.txt", user_id, problem_id);
        PutObjectRequest putObjectRequest = PutObjectRequest.builder().bucket(bucket).key(s3Key).
                contentType("text/plain").build();
        byte[] codeBytes = sourceCode.getBytes(StandardCharsets.UTF_8);
        s3client.putObject(putObjectRequest, RequestBody.fromBytes(codeBytes));
        String s3_path = String.format("s3://%s/%s", bucket, s3Key);

        return s3_path;
    }

    @Transactional
    public Long processSubmission(Long userId, Long problemId, Long roomId, String language, String sourceCode)
    throws Exception {
        User user = userRepository.findById(userId).
                orElseThrow(() -> new IllegalArgumentException("Invalid user ID: "+ userId));
        Problem problem = problemRepository.findById(problemId).
                orElseThrow(() -> new IllegalArgumentException("Invalid problem ID: "+ problemId));
        Room room = roomRepository.findById(roomId).
                orElseThrow(() -> new IllegalArgumentException("Invalid room ID: "+ roomId));

        Code code = new Code();
        code.setLanguage(language);
        code.setProblem(problem);
        code.setRoom(room);
        code.setUser(user);
        code.setStatus(false);

        Code savedCode = codeRepository.save(code);
        Long submissionId = savedCode.getId();

        codeRepository.save(savedCode);

        return submissionId;
    }
}