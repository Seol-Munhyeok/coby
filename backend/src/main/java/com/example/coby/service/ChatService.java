package com.example.coby.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    public void processMessage(WebSocketSession session, String message) { //
        // 메시지 저장, 필터링, 사용자 정보 파악 등의 로직 작성
        log.info("메시지 처리: 세션={}, 메시지={}", session.getId(), message); //
        // 현재는 단순히 로깅만 수행합니다.
        // 실제 애플리케이션에서는 이 메시지를 파싱하여 데이터베이스에 저장하거나,
        // 특정 비즈니스 로직을 수행할 수 있습니다.
    }
}