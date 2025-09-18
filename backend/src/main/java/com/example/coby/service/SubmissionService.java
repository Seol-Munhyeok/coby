package com.example.coby.service;

import com.example.coby.dto.RoomResultDto;
import com.example.coby.dto.SubmissionResponseDto;
import com.example.coby.dto.WinnerCodeDto;
import com.example.coby.entity.Problem;
import com.example.coby.entity.Room;
import com.example.coby.entity.User;
import com.example.coby.entity.submission;
import com.example.coby.property.awsProperties;
import com.example.coby.repository.ProblemRepository;
import com.example.coby.repository.RoomRepository;
import com.example.coby.repository.SubmissionRepository;
import com.example.coby.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.awspring.cloud.sqs.annotation.SqsListener;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.async.AsyncResponseTransformer;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.core.retry.RetryMode;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.async.SdkAsyncHttpClient;
import software.amazon.awssdk.http.nio.netty.NettyNioAsyncHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;


@Slf4j
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
    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;
    private static S3AsyncClient s3AsyncClient;

    public static S3AsyncClient getAsyncClient() {
        if (s3AsyncClient == null) {

            SdkAsyncHttpClient httpClient = NettyNioAsyncHttpClient.builder()
                    .maxConcurrency(50)  // Adjust as needed.
                    .connectionTimeout(Duration.ofSeconds(60))  // Set the connection timeout.
                    .readTimeout(Duration.ofSeconds(60))  // Set the read timeout.
                    .writeTimeout(Duration.ofSeconds(60))  // Set the write timeout.
                    .build();

            ClientOverrideConfiguration overrideConfig = ClientOverrideConfiguration.builder()
                    .apiCallTimeout(Duration.ofMinutes(2))  // Set the overall API call timeout.
                    .apiCallAttemptTimeout(Duration.ofSeconds(90))  // Set the individual call attempt timeout.
                    .retryStrategy(RetryMode.STANDARD)
                    .build();

            s3AsyncClient = S3AsyncClient.builder()
                    .region(Region.AP_NORTHEAST_2)
                    .httpClient(httpClient)
                    .overrideConfiguration(overrideConfig)
                    .build();
        }
        return s3AsyncClient;
    }

    public CompletableFuture<String> getObjectBytesAsync(String bucketName, String keyName) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .key(keyName)
                .bucket(bucketName)
                .build();

        CompletableFuture<ResponseBytes<GetObjectResponse>> response = getAsyncClient().getObject(objectRequest, AsyncResponseTransformer.toBytes());
        return response.thenApply(objectBytes -> {
            try {
                byte[] data = objectBytes.asByteArray();
                String content = new String(data, StandardCharsets.UTF_8); // 파일 대신 문자열로 변환
                log.info("Successfully obtained string from an S3 object");
                return content;
            } catch (Exception ex) {
                throw new RuntimeException("Failed to convert object to string", ex);
            }
        }).whenComplete((resp, ex) -> {
            if (ex != null) {
                throw new RuntimeException("Failed to get object bytes from S3", ex);
            }
        });
    }

    public WinnerCodeDto getWinnerCode(Long id) {
        submission submission = submissionRepository.getReferenceById(id);
        String language = submission.getLanguage();
        WinnerCodeDto winnerCodeDto = new WinnerCodeDto();
        winnerCodeDto.setLanguage(language);
        winnerCodeDto.setId(submission.getUser().getId());
        String s3_path = submission.getS3CodePath();
        String bucket = awsProperties.getS3().getBucket();

        CompletableFuture<String> code = getObjectBytesAsync(bucket, s3_path);
        winnerCodeDto.setCode(code.join());
        return winnerCodeDto;
    }

    @Transactional(readOnly = true)
    public SubmissionResponseDto getSubmissionDtoById(Long submissionId) {
        submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 Submission을 찾을 수 없습니다: " + submissionId));
        System.out.println("🔥 확인 중인 제출: " + submission);
        return convertToDto(submission);
    }

    private SubmissionResponseDto convertToDto(submission sub){
        return SubmissionResponseDto.builder()
                .submissionId(sub.getId())
                .result(sub.getStatus())
                .details(sub.getDetails())
                .build();
    }

    @SqsListener("result-queue")
    @Transactional
    public void updateSubmissionStatus(SubmissionResponseDto resultDto){
        log.info("result-queue로부터 메시지를 받았습니다: {}", resultDto);
        Long submissionId = resultDto.getSubmissionId();
        submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(EntityNotFoundException::new);
        submission.setStatus(resultDto.getResult());
        submission.setDetails(resultDto.getDetails());
        submissionRepository.save(submission);
        log.info("Submission ID {}의 상태가 '{}'(으)로 업데이트되었습니다.", submissionId,
                resultDto.getResult());

        Room room = submission.getRoom();
//        if (room.getStatus() == RoomStatus.RESULT) {
//            return;
//        }

        if ("Accepted".equals(resultDto.getResult()) && room.getWinnerId() == null) {
            Long roomId = room.getId();
            Long userId = submission.getUser().getId();

            log.info("승자 후보 감지: roomId={}, userId={}, nickname={}, submissionId={}",
                    roomId, userId, submission.getUser().getNickname(), submissionId);

            roomService.finishRoom(roomId, submissionId);

            RoomResultDto winnerDto = RoomResultDto.builder()
                    .roomId(roomId)
                    .userId(userId)
                    .submissionId(submissionId)
                    .nickname(submission.getUser().getNickname())
                    .submittedAt(LocalDateTime.now())
                    .build();

            log.info("승자 확정: roomId={}, winnerId={}, nickname={}, submissionId={}",
                    roomId, userId, submission.getUser().getNickname(), submissionId);

            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/result", winnerDto);
        }
    }

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

        return s3Key;
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