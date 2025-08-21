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
    private final Map<String, String> userToSession = new ConcurrentHashMap<>();

    /**
     * 채팅 메시지를 수신하여 해당 방의 모든 클라이언트에게 전송(브로드캐스팅)합니다.
     * 클라이언트가 `/pub/room/{roomId}/chat` 경로로 메시지를 발행하면 이 메소드가 호출됩니다.
     */
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

    /**
     * 사용자가 방에 입장했을 때의 처리를 담당합니다.
     * 새로운 사용자의 입장을 방 전체에 알리고, 새로 입장한 사용자에게는 현재 방의 사용자 목록을 보내줍니다.
     */
    @MessageMapping("/room/{roomId}/join")
    public void handleUserJoin(@DestinationVariable String roomId,
                          WsMessageDto message,
                          SimpMessageHeaderAccessor headerAccessor) {
        sessionToRoom.put(headerAccessor.getSessionId(), roomId);
        sessionToUser.put(headerAccessor.getSessionId(), message.userId());
        userToSession.put(message.userId(), headerAccessor.getSessionId());

        roomService.addUserToRoom(message.userId(), roomId);
        log.info("방 [{}] 에 유저 {} 입장", roomId, message.userId());

        // 입장한 사용자가 방장인지 확인
        boolean isHost = roomService.isUserHost(Long.parseLong(roomId), Long.parseLong(message.userId()));

        // 방 전체에 새로운 사용자 입장을 알림
        WsMessageDto joinNotice = WsMessageDto.builder()
                .type("Join")
                .roomId(roomId)
                .userId(message.userId())
                .nickname(message.nickname())
                .profileUrl(message.profileUrl())
                .isReady(Boolean.FALSE)
                .isHost(isHost)
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + roomId, joinNotice);

        // 새로 입장한 사용자에게만 현재 방에 있는 유저 목록을 전송
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

    /**
     * 사용자의 '준비' 상태 변경을 처리하고, 변경된 상태를 방 전체에 알립니다.
     */
    @MessageMapping("/room/{roomId}/ready")
    public void handleReady(@DestinationVariable String roomId,
                            WsMessageDto message) {
        log.info("레디 상태 변경 요청 수신: RoomId={}, UserId={}, IsReady={}",
                roomId, message.userId(), message.isReady());
        try {
            Long uid = Long.parseLong(message.userId());
            Long rid = Long.parseLong(roomId);
            boolean isReady = Boolean.TRUE.equals(message.isReady());
            // 사용자의 준비 상태를 DB 등에 업데이트
            roomService.updateReadyStatus(uid, rid, isReady);

            // 방 전체에 상태 변경 알림
            WsMessageDto readyNotice = WsMessageDto.builder()
                    .type("Ready")
                    .roomId(roomId)
                    .userId(message.userId())
                    .isReady(isReady)
                    .build();

            log.info("레디 상태 변경 알림 전송: Topic=/topic/room/{}, Payload={}",
                    roomId, readyNotice);

            messagingTemplate.convertAndSend("/topic/room/" + roomId, readyNotice);
        } catch (NumberFormatException e) {
            log.warn("올바르지 않은 ID: userId={}, roomId={}", message.userId(), roomId);
        }
    }

    /**
     * 방장이 다른 사용자에게 방장 권한을 위임하는 기능을 처리합니다.
     */
    @MessageMapping("/room/{roomId}/host")
    public void handleDelegateHost(@DestinationVariable String roomId,
                                   WsMessageDto message,
                                   SimpMessageHeaderAccessor headerAccessor) {
        String requesterId = sessionToUser.get(headerAccessor.getSessionId());
        try {
            Long rid = Long.parseLong(roomId);
            Long newHostId = Long.parseLong(message.userId());  // 새로 방장이 될 사용자 ID
            Long reqId = requesterId != null ? Long.parseLong(requesterId) : null;

            // 요청자가 방장일 경우에만 권한 위임 실행
            if (reqId == null || !roomService.isUserHost(rid, reqId)) {
                return;
            }
            roomService.delegateHost(rid, newHostId);

            // 방 전체에 새로운 방장 정보 알림
            WsMessageDto hostNotice = WsMessageDto.builder()
                    .type("Host")
                    .roomId(roomId)
                    .userId(message.userId())
                    .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId, hostNotice);
        } catch (NumberFormatException e) {
            log.warn("올바르지 않은 ID: roomId={}, userId={}", roomId, message.userId());
        }
    }

    /**
     * 방장이 게임 시작을 요청했을 때, 방 전체에 게임 시작을 알립니다.
     */
    @MessageMapping("/room/{roomId}/start")
    public void handleStartGame(@DestinationVariable String roomId,
                                WsMessageDto message,
                                SimpMessageHeaderAccessor headerAccessor) {
        String requesterId = sessionToUser.get(headerAccessor.getSessionId());
        try {
            Long rid = Long.parseLong(roomId);
            Long reqId = requesterId != null ? Long.parseLong(requesterId) : null;
            // 요청자가 방장일 경우에만 게임 시작 실행
            if (reqId == null || !roomService.isUserHost(rid, reqId)) {
                return;
            }
            WsMessageDto startNotice = WsMessageDto.builder()
                    .type("StartGame")
                    .roomId(roomId)
                    .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId, startNotice);
        } catch (NumberFormatException e) {
            log.warn("올바르지 않은 ID: roomId={}, userId={}", roomId, requesterId);
        }
    }

    /**
     * 방장이 특정 사용자를 방에서 강제로 퇴장시키는 기능을 처리합니다.
     * 강퇴 사실을 방 전체에 알리고, 강퇴당한 사용자에게는 개인적으로 알림을 보냅니다.
     */
    @MessageMapping("/room/{roomId}/kick")
    public void handleKick(@DestinationVariable String roomId,
                           WsMessageDto message,
                           SimpMessageHeaderAccessor headerAccessor) {
        // 강퇴를 요청한 사람(방장)의 유저 ID를 세션에서 조회
        String requesterId = sessionToUser.get(headerAccessor.getSessionId());
        try {
            Long rid = Long.parseLong(roomId);
            Long reqId = requesterId != null ? Long.parseLong(requesterId) : null;
            Long targetId = Long.parseLong(message.userId());  // 강퇴 대상 유저 ID

            // 요청자가 없거나, 방장이 아니면 로직을 중단
            if (reqId == null || !roomService.isUserHost(rid, reqId)) {
                return;
            }

            // 강퇴 대상의 세션 ID를 Map에서 조회
            String targetSessionId = userToSession.get(message.userId());
            if (targetSessionId == null) {
                // 이미 나간 유저일 경우 처리 중단
                return;
            }

            // 1. 서비스에서 유저 제거
            roomService.removeUserFromRoom(message.userId(), roomId);
            // 2. 상태 관리 Map에서 제거 (메모리 정리)
            sessionToRoom.remove(targetSessionId);
            sessionToUser.remove(targetSessionId);
            userToSession.remove(message.userId());

            // 3. 방에 남아있는 사람들에게 누가 나갔는지 알림
            WsMessageDto leaveNotice = WsMessageDto.builder()
                    .type("Leave")
                    .roomId(roomId)
                    .userId(message.userId())
                    .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveNotice);

            // 4. 강퇴당한 당사자에게만 "Kicked" 메시지를 전송
            WsMessageDto kickedNotice = WsMessageDto.builder()
                    .type("Kicked")
                    .roomId(roomId)
                    .build();
            // convertAndSendToUser는 특정 세션(사용자)에게만 메시지를 보냄
            messagingTemplate.convertAndSendToUser(targetSessionId, "/queue/kicked", kickedNotice);
        } catch (NumberFormatException e) {
            log.warn("올바르지 않은 ID: roomId={}, userId={}", roomId, message.userId());
        }

    }


    /**
     * 사용자가 자발적으로 방을 나가는 요청을 처리합니다.
     * 나가는 사용자가 방장이었다면 다른 사람에게 방장을 위임합니다.
     */
    @MessageMapping("/room/{roomId}/leave")
    public void handleLeave(@DestinationVariable String roomId,
                          WsMessageDto message,
                          SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        // 이미 새로운 세션으로 재입장한 뒤 이전 세션에서 온 Leave 메시지는 무시한다.
        String mappedSession = userToSession.get(message.userId());
        if (mappedSession == null || !mappedSession.equals(sessionId)) {
            return;
        }

        boolean wasHost = roomService.isUserHost(Long.parseLong(roomId), Long.parseLong(message.userId()));
        roomService.removeUserFromRoom(message.userId(), roomId);
        sessionToRoom.remove(headerAccessor.getSessionId());
        sessionToUser.remove(headerAccessor.getSessionId());
        userToSession.remove(message.userId());  // 자발적으로 방을 떠난 사용자의 세션 정보도 정리

        WsMessageDto leaveNotice = WsMessageDto.builder()
                .type("Leave")
                .roomId(roomId)
                .userId(message.userId())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveNotice);

        if (wasHost) {
            Long newHost = roomService.findFirstUserId(Long.parseLong(roomId));
            if (newHost != null) {
                roomService.delegateHost(Long.parseLong(roomId), newHost);
                WsMessageDto hostNotice = WsMessageDto.builder()
                        .type("Host")
                        .roomId(roomId)
                        .userId(String.valueOf(newHost))
                        .build();
                messagingTemplate.convertAndSend("/topic/room/" + roomId, hostNotice);
            }
        }
    }

    /**
     * 사용자의 WebSocket 연결이 비정상적으로(예: 브라우저 종료) 끊겼을 때 호출되는 이벤트 리스너입니다.
     * 자발적으로 나가는 것과 동일하게 사용자 정보 제거 및 방장 위임 로직을 수행하여 상태를 일관되게 유지합니다.
     */
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String roomId = sessionToRoom.remove(sessionId);
        String userId = sessionToUser.remove(sessionId);

        // 연결 종료 시 userToSession 매핑도 제거하여 메모리를 정리한다.
        if (userId != null) {
            userToSession.remove(userId);
        }

        if (roomId != null && userId != null) {
            boolean wasHost = roomService.isUserHost(Long.parseLong(roomId), Long.parseLong(userId));
            roomService.removeUserFromRoom(userId, roomId);

            // 방 전체에 퇴장 알림
            WsMessageDto leaveNotice = WsMessageDto.builder()
                    .type("Leave")
                    .roomId(roomId)
                    .userId(userId)
                    .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveNotice);

            // 나간 사람이 방장이었다면 방장 위임
            if (wasHost) {
                Long newHost = roomService.findFirstUserId(Long.parseLong(roomId));
                if (newHost != null) {
                    roomService.delegateHost(Long.parseLong(roomId), newHost);
                    WsMessageDto hostNotice = WsMessageDto.builder()
                            .type("Host")
                            .roomId(roomId)
                            .userId(String.valueOf(newHost))
                            .build();
                    messagingTemplate.convertAndSend("/topic/room/" + roomId, hostNotice);
                }
            }
        }
    }
}