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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.sqs.SqsAsyncClient;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final CodeRepository codeRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final RoomRepository roomRepository;

    private final ObjectMapper objectMapper;
    private final awsProperties awsProperties;
    private final S3Client s3Client;
    private final SqsAsyncClient sqsAsyncClient;

    @Transactional
    public Long processSubmission(Long userId, Long problemId, Long roomId, String language, String sourceCode)
    throws Exception {
        User user = userRepository.findById(userId).
                orElseThrow(() -> new IllegalArgumentException("Invalid user ID: "+ userId));
        Problem problem = problemRepository.findById(problemId).
                orElseThrow(() -> new IllegalArgumentException("Invalid problem ID: "+ problemId));
        Room room = roomRepository.findById(userId).
                orElseThrow(() -> new IllegalArgumentException("Invalid room ID: "+ roomId));

        Code code = new Code();
        code.setLanguage(language);
        code.setProblem(problem);
        code.setRoom(room);
        code.setUser(user);
        code.setStatus(false);

        Code savedCode = codeRepository.save(code);
        Long submissionId = savedCode.getId();

        String bucket = awsProperties.getS3().getBucket();
        String s3Key = String.format("submissions/%d/%d/Main.%s", userId, submissionId, language.toLowerCase());
        PutObjectRequest putObjectRequest = PutObjectRequest.builder().bucket(bucket).key(s3Key).
                contentType("text/plain").build();
        byte[] codeBytes = sourceCode.getBytes(StandardCharsets.UTF_8);
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(codeBytes));
        String s3path = String.format("s3://%s/%s", bucket, s3Key);

        savedCode.setS3CodePath(s3path);
        codeRepository.save(savedCode);

        Map<String, Object> messagePayload = new HashMap<>();
        messagePayload.put("submissionId", submissionId.toString());
        messagePayload.put("problemId", problemId.toString());
        messagePayload.put("userId", userId.toString());
        messagePayload.put("s3_code_path", s3path);
        messagePayload.put("language", language);

        String messageBody = objectMapper.writeValueAsString(messagePayload);
        String sqsQueueUrl = awsProperties.getSqs().getQueue().getUrl();

        SendMessageRequest sendMessageRequest = SendMessageRequest.builder().
                queueUrl(sqsQueueUrl).messageBody(messageBody).build();

        sqsAsyncClient.sendMessage(sendMessageRequest);

        return submissionId;
    }
}
