package com.example.coby.controller;

import com.example.coby.dto.*;
import com.example.coby.entity.Problem;
import com.example.coby.entity.Room;
import com.example.coby.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public List<RoomResponse> getRooms() {
        return roomService.getRooms().stream()
                .map(RoomResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse createRoom(@RequestBody CreateRoomRequest request) {
        Room room = roomService.createRoom(request);
        return RoomResponse.from(room);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable Long id) {
        Room room = roomService.getRoom(id);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(RoomResponse.from(room));
    }

    @GetMapping("/{id}/problem")
    public ResponseEntity<ProblemResponse> getRoomProblem(@PathVariable Long id) {
        Problem problem = roomService.getRoomProblem(id);
        if (problem == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ProblemResponse.from(problem));
    }
    @PostMapping("/{id}/change-problem")
    public ResponseEntity<RoomResponse> changeRoomProblem(@PathVariable Long id) {
        Room updatedRoom = roomService.changeRoomProblem(id);
        if (updatedRoom == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(RoomResponse.from(updatedRoom));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<RoomResponse> joinRoom(@PathVariable Long id,
                                                 @RequestBody JoinRoomRequest request) {
        Room room = roomService.joinRoom(id, request.userId());
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(RoomResponse.from(room));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<RoomResponse> leaveRoom(@PathVariable Long id,
                                                  @RequestBody LeaveRoomRequest request) {
        Room room = roomService.leaveRoom(id, request.userId());
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(RoomResponse.from(room));
    }

    @GetMapping("/{id}/users")
    public List<RoomUserResponse> getRoomUsers(@PathVariable Long id) {
        return roomService.getRoomUsers(id);
    }

    @PostMapping("/{id}/verify-password")
    public ResponseEntity<Void> verifyPassword(@PathVariable Long id,
                                               @RequestBody VerifyPasswordRequest request) {
        boolean valid = roomService.verifyPassword(id, request.password());
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok().build();
    }
}