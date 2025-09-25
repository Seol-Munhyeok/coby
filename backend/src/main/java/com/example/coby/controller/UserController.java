package com.example.coby.controller;

import com.example.coby.dto.*;
import com.example.coby.entity.User;
import com.example.coby.repository.UserRepository;
import com.example.coby.security.CustomOAuth2User;
import com.example.coby.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/rankings")
    public List<RankingDto> getRankings() {
        return userService.Rankings();
    }

    @GetMapping("/{userId}")
    public UserProfileResponse findProfile(@PathVariable long userId){
        return userService.getUserProfile(userId);
    }


    @GetMapping("/check-nickname")
    public NicknameCheckResponse checkNickname(@RequestParam String nickname) {
        return userService.checkNickname(nickname);
    }

    @PutMapping("/nickname")
    public ChangeNicknameResponse changeNickname(@RequestBody ChangeNicknameRequest request) {
        return userService.changeNickname(request);
    }

    @GetMapping("/me")
    public UserProfileResponse getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomOAuth2User principal = (CustomOAuth2User) auth.getPrincipal();
        Long userId = principal.getUserId();

        return userService.getUserProfile(userId);
    }
}
