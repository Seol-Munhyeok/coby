package com.example.coby.controller;

import com.example.coby.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper; // ObjectMapper 임포트
import com.fasterxml.jackson.core.JsonProcessingException; // JsonProcessingException 임포트

import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketController extends TextWebSocketHandler {

    private final ChatService chatService;
    private final ObjectMapper objectMapper = new ObjectMapper(); // ObjectMapper 인스턴스 생성

    private final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("새로운 연결: {}", session.getId());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        String receivedPayload = message.getPayload(); //
        log.info("수신 메시지: {}", receivedPayload); //

        // 메시지 처리 서비스 호출 (여기서는 간단히 로깅)
        chatService.processMessage(session, receivedPayload); //

        // 모든 클라이언트에게 메시지 전송
        for (WebSocketSession s : sessions) { //
            if (s.isOpen()) { //
                try {
                    // 수신된 JSON 메시지를 그대로 모든 클라이언트에게 브로드캐스트
                    s.sendMessage(new TextMessage(receivedPayload)); //
                } catch (Exception e) {
                    log.error("메시지 전송 실패: {}", e.getMessage()); //
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.info("연결 종료: {}", session.getId());
    }
}