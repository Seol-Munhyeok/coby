package com.example.coby.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.coby.dto.JoinRoomMessage;
import com.example.coby.dto.CodeUpdateMessage;
import com.example.coby.dto.RoomParticipant;
import com.example.coby.dto.RoomParticipantsMessage;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class BattleRoomController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private com.example.coby.service.RoomService roomService;
    private final Map<String, Map<String, RoomParticipant>> rooms = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToRoom = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    @MessageMapping("/code_update")
    public void handleCodeUpdate(CodeUpdateMessage message) {
        System.out.println("Code update received: UserId=" + message.userId() +
                ", RoomId=" + message.roomId() +
                ", LineCount=" + message.lineCount()); // ✨ code 및 language 로그 제거

        rooms.computeIfPresent(message.roomId(), (roomId, participants) -> {
            participants.computeIfPresent(message.userId(), (userId, participant) -> {
                return participant.withLineCount(message.lineCount()); // ✨ withCode() 호출 제거
            });
            return participants;
        });

        messagingTemplate.convertAndSend("/topic/room/" + message.roomId(), message);
    }

    @MessageMapping("/submit_code")
    public void handleSubmitCode(CodeUpdateMessage message) {
        System.out.println("Code submission received: UserId=" + message.userId() +
                ", RoomId=" + message.roomId());
        // System.out.println(", Language=" + message.language() +
        //                    ", Code=\n" + message.code());


    }

    @MessageMapping("/join_room")
    public void handleJoinRoom(JoinRoomMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        System.out.println("User " + message.userId() + " joined room " + message.roomId() + " session=" + sessionId);

        sessionToRoom.put(sessionId, message.roomId());
        sessionToUser.put(sessionId, message.userId());

        rooms.computeIfAbsent(message.roomId(), k -> new ConcurrentHashMap<>())
                .put(message.userId(), RoomParticipant.builder()
                        .userId(message.userId())
                        .userName("Player_" + message.userId().substring(message.userId().length() - 4))
                        .progress(0.0)
                        .lineCount(0)
                        .code("") // RoomParticipant에는 code 필드를 유지할 수 있습니다 (초기값으로 빈 문자열)
                        .build());

        RoomParticipantsMessage roomParticipantsMessage = RoomParticipantsMessage.builder()
                .type("room_participants")
                .roomId(message.roomId())
                .participants(rooms.get(message.roomId()).values().stream().toList())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + message.roomId(), roomParticipantsMessage);
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String roomId = sessionToRoom.remove(sessionId);
        String userId = sessionToUser.remove(sessionId);
        if (roomId != null && userId != null) {
            rooms.computeIfPresent(roomId, (rId, participants) -> {
                participants.remove(userId);
                return participants;
            });
            // roomService.removeUserFromRoom(userId, roomId); 이 코드 때문에 방을 나가도 인원이 남아있게 되었음
            RoomParticipantsMessage msg = RoomParticipantsMessage.builder()
                    .type("room_participants")
                    .roomId(roomId)
                    .participants(rooms.getOrDefault(roomId, Map.of()).values().stream().toList())
                    .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId, msg);
        }
    }
}
