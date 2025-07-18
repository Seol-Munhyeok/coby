package com.example.coby.controller;

import com.example.coby.dto.ChangeNicknameRequest;
import com.example.coby.dto.ChangeNicknameResponse;
import com.example.coby.dto.NicknameCheckResponse;
import com.example.coby.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/check-nickname")
    public NicknameCheckResponse checkNickname(@RequestParam String nickname) {
        return userService.checkNickname(nickname);
    }

    @PutMapping("/nickname")
    public ChangeNicknameResponse changeNickname(@RequestBody ChangeNicknameRequest request) {
        return userService.changeNickname(request);
    }
}
