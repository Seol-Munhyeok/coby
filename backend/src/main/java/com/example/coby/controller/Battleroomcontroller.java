package com.example.coby.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.coby.dto.JoinRoomMessage;
import com.example.coby.dto.CodeUpdateMessage;
import com.example.coby.dto.RoomParticipant;
import com.example.coby.dto.RoomParticipantsMessage;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class Battleroomcontroller {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Map<String, Map<String, RoomParticipant>> rooms = new ConcurrentHashMap<>();

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
    public void handleJoinRoom(JoinRoomMessage message) {
        System.out.println("User " + message.userId() + " joined room " + message.roomId());

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
}