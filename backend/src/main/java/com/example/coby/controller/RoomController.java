package com.example.coby.controller;

import com.example.coby.dto.*;
import com.example.coby.entity.Problem;
import com.example.coby.entity.Room;
import com.example.coby.repository.SubmissionRepository;
import com.example.coby.service.RestartService;
import com.example.coby.service.RoomService;
import com.example.coby.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final SubmissionService submissionService;
    private final SubmissionRepository submissionRepository;
    private final RestartService restartService;

    @GetMapping
    public List<RoomResponse> getRooms() {
        return roomService.getRooms();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse createRoom(@RequestBody CreateRoomRequest request) {
        Room room = roomService.createRoom(request);
        return RoomResponse.from(room);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id,
                                                   @RequestBody UpdateRoomRequest request) {
        try {
            Room room = roomService.updateRoom(id, request);
            return ResponseEntity.ok(RoomResponse.from(room));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable Long id) {
        Room room = roomService.getRoom(id);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(RoomResponse.from(room));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<UserRoomResultDto>> getHistory(@PathVariable Long id){
        List<UserRoomResultDto> histories = roomService.getHistories(id);
        if (histories.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(histories);
    }

    @GetMapping("/{id}/host")
    public ResponseEntity<RoomHostResponse> getRoomHost(@PathVariable Long id) {
        return roomService.getRoomHost(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/problem")
    public ResponseEntity<ProblemResponse> getRoomProblem(@PathVariable Long id) {
        Problem problem = roomService.getRoomProblem(id);
        if (problem == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ProblemResponse.from(problem));
    }

    @PostMapping("/restart/{roomId}")
    public ResponseEntity<Map<String, Object>> requestRestart(
            @PathVariable Long roomId,
            @RequestBody Map<String, Long> request) {

        try {
            Long userId = request.get("userId");
            restartService.initiateRestart(roomId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "재시작 투표가 시작되었습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
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
    @PostMapping("/{id}/start")
    public ResponseEntity<Void> startGame(@PathVariable Long id) {
        roomService.startGame(id);
        return ResponseEntity.ok().build();
    }
}