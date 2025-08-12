package com.example.coby.service;

import com.example.coby.entity.submission;
import com.example.coby.entity.Problem;
import com.example.coby.entity.Room;
import com.example.coby.entity.User;
import com.example.coby.property.awsProperties;
import com.example.coby.repository.SubmissionRepository;
import com.example.coby.repository.ProblemRepository;
import com.example.coby.repository.RoomRepository;
import com.example.coby.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.S3Client;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final S3Client s3client;
    private final ObjectMapper objectMapper;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final RoomRepository roomRepository;
    private final awsProperties awsProperties;


    public String processWrapping(String sourceCode, String language,Long user_id, Long problem_id) {
        String bucket = awsProperties.getS3().getBucket();
        Map<String, String> lang = new HashMap<String, String>();
        lang.put("python","py");
        lang.put("java","java");
        lang.put("cpp","cpp");

        Map<String, String> contentTypeMap = Map.of(
                "python", "text/x-python",
                "java", "text/x-java-source",
                "cpp", "text/x-c++src"
        );

        String s3Key = String.format("submissions/%d/%d/Main.%s", user_id, problem_id,lang.get(language));
        PutObjectRequest putObjectRequest = PutObjectRequest.builder().bucket(bucket).key(s3Key).
                contentType(contentTypeMap.get(language)).build();
        byte[] codeBytes = sourceCode.getBytes(StandardCharsets.UTF_8);
        s3client.putObject(putObjectRequest, RequestBody.fromBytes(codeBytes));
        String s3_path = String.format("s3://%s/%s", bucket, s3Key);

        return s3_path;
    }

    @Transactional
    public Long processSubmission(Long userId, Long problemId, Long roomId, String language, String source_path)
    throws Exception {
        User user = userRepository.findById(userId).
                orElseThrow(() -> new IllegalArgumentException("Invalid user ID: "+ userId));
        Problem problem = problemRepository.findById(problemId).
                orElseThrow(() -> new IllegalArgumentException("Invalid problem ID: "+ problemId));
        Room room = roomRepository.findById(roomId).
                orElseThrow(() -> new IllegalArgumentException("Invalid room ID: "+ roomId));

        submission sub = new submission();
        sub.setLanguage(language);
        sub.setProblem(problem);
        sub.setRoom(room);
        sub.setUser(user);
        sub.setStatus("Pending");
        sub.setS3CodePath(source_path);

        submission savedCode = submissionRepository.save(sub);
        Long submissionId = savedCode.getId();

        return submissionId;
    }
}