package com.example.coby.controller;

import com.example.coby.dto.CreateRoomRequest;
import com.example.coby.dto.RoomResponse;
import com.example.coby.dto.VerifyPasswordRequest;
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

    @PostMapping("/{id}/join")
    public ResponseEntity<RoomResponse> joinRoom(@PathVariable Long id) {
        Room room = roomService.joinRoom(id);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(RoomResponse.from(room));
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