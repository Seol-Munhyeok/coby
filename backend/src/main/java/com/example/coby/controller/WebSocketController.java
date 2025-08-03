package com.example.coby.controller;

import com.example.coby.dto.RoomUserResponse;
import com.example.coby.dto.WsMessageDto;
import com.example.coby.service.ChatService;
import com.example.coby.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.websocket.WsPongMessage;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper; // ObjectMapper 임포트
import com.fasterxml.jackson.core.JsonProcessingException; // JsonProcessingException 임포트
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService;

    private final Map<String, String> sessionToRoom = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    @MessageMapping("/room/{roomId}/chat")
    public void handleChatMessage(@DestinationVariable String roomId,
                             WsMessageDto message,
                             SimpMessageHeaderAccessor headerAccessor) {
        if (!"Chat".equalsIgnoreCase(message.type())) {
            return;
        }

        if (!roomService.isUserInRoom(roomId, message.userId())) {
            log.warn("사용자 {} 는 방 {} 에 속해있지 않습니다.", message.userId(), roomId);
            return;
        }

        chatService.processMessage(roomId, message);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
        log.info("방 [{}] 에 채팅 메시지 전송: {}", roomId, message.content());
    }

    @MessageMapping("/room/{roomId}/join")
    public void handleUserJoin(@DestinationVariable String roomId,
                          WsMessageDto message,
                          SimpMessageHeaderAccessor headerAccessor) {
        sessionToRoom.put(headerAccessor.getSessionId(), roomId);
        sessionToUser.put(headerAccessor.getSessionId(), message.userId());

        roomService.addUserToRoom(message.userId(), roomId);
        log.info("방 [{}] 에 유저 {} 입장", roomId, message.userId());

        WsMessageDto joinNotice = WsMessageDto.builder()
                .type("Join")
                .roomId(roomId)
                .userId(message.userId())
                .nickname(message.nickname())
                .profileUrl(message.profileUrl())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId, joinNotice);

        if (headerAccessor.getUser() != null) {
            List<RoomUserResponse> users = roomService.getRoomUsers(Long.parseLong(roomId));
            WsMessageDto currentUsers = WsMessageDto.builder()
                    .type("CurrentUsers")
                    .roomId(roomId)
                    .users(users)
                    .build();

            messagingTemplate.convertAndSendToUser(headerAccessor.getUser().getName(),
                    "/queue/room/" + roomId + "/users", currentUsers);

            log.info("유저 {} 에게 방 [{}] 현재 유저 목록 전송", headerAccessor.getUser().getName(), roomId);
        }
    }

    @MessageMapping("/room/{roomId}/leave")
    public void handleLeave(@DestinationVariable String roomId,
                          WsMessageDto message,
                          SimpMessageHeaderAccessor headerAccessor) {
        roomService.removeUserFromRoom(message.userId(), roomId);
        sessionToRoom.remove(headerAccessor.getSessionId());
        sessionToUser.remove(headerAccessor.getSessionId());

        WsMessageDto leaveNotice = WsMessageDto.builder()
                .type("Leave")
                .roomId(roomId)
                .userId(message.userId())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveNotice);
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String roomId = sessionToRoom.remove(sessionId);
        String userId = sessionToUser.remove(sessionId);

        if (roomId != null && userId != null) {
            roomService.removeUserFromRoom(userId, roomId);
            WsMessageDto leaveNotice = WsMessageDto.builder()
                    .type("Leave")
                    .roomId(roomId)
                    .userId(userId)
                    .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveNotice);
        }
    }
}