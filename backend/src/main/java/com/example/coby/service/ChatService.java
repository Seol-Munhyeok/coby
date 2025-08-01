package com.example.coby.service;

import com.example.coby.dto.WsMessageDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    public void processMessage(String roomId, WsMessageDto message) { //
        log.info("ChatService에서 메시지 처리: 방 [{}], 발신자 [{}], 내용 [{}]", roomId, message.nickname(), message.content());
        // 메시지를 DB에 저장하거나 추가 로직을 수행할 수 있습니다.
    }
}