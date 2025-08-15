package com.example.coby.service;

import com.example.coby.dto.JudgeRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.MessageAttributeValue;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;
import software.amazon.awssdk.services.sns.model.SnsException;

import java.util.Map;
import java.util.HashMap;


@Service
public class JudgeNotificationService {

    private final SnsClient snsClient;
    private final ObjectMapper objectMapper;
    private final String judgeTopicArn;

    public JudgeNotificationService(
            @Value("${aws.sns.topic-arn}") String judgeTopicArn,
            @Value("${spring.cloud.aws.region.static}") String awsRegion) {
        this.judgeTopicArn = judgeTopicArn;
        this.snsClient = SnsClient.builder()
                .region(Region.of(awsRegion))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String sendJudgeRequest(JudgeRequest judgeRequest) {
        try {
            String messageBody = objectMapper.writeValueAsString(judgeRequest);
            String language = judgeRequest.getLanguage();
            Map<String, MessageAttributeValue> attributes = new HashMap<>();
            attributes.put("tokens", MessageAttributeValue.builder()
                    .stringValue(language)
                    .dataType("String").build());
            PublishRequest request = PublishRequest.builder()
                    .message(messageBody)
                    .messageAttributes(attributes)
                    .subject("Judge Request - Submission" + judgeRequest.getSubmission_id())
                    .topicArn(judgeTopicArn)
                    .build();
            PublishResponse publishResponse = snsClient.publish(request);

            System.out.println("채점 요청 성공 - MessageId:" + publishResponse.messageId() + "SubmissionId: " + judgeRequest.getSubmission_id());
            return publishResponse.messageId();
        } catch (JsonProcessingException e) {
            System.err.println("채점 요청 json 변환 실패: " + e.getMessage());
            throw new RuntimeException("채점 요청 변환 실패", e);
        } catch (SnsException e) {
            System.err.println("채점 요청 전송 실패: " + e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Sns 채점 요청 전송 실패", e);
        }
    }
}
