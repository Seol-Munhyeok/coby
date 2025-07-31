package com.example.coby.controller;

import com.example.coby.dto.ChangeNicknameRequest;
import com.example.coby.dto.ChangeNicknameResponse;
import com.example.coby.dto.NicknameCheckResponse;
import com.example.coby.dto.UserProfileResponse;
import com.example.coby.entity.User;
import com.example.coby.repository.UserRepository;
import com.example.coby.security.CustomOAuth2User;
import com.example.coby.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

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

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));

        return new UserProfileResponse(
                user.getId(),
                user.getNickname(),
                user.getEmail(),
                user.getSsoProvider(),
                user.getProviderId(),
                user.getPreferredLanguage(),
                user.getReportCount(),
                user.getTotalGame(),
                user.getWinGame(),
                user.getTierPoint(),
                user.getTier() != null ? user.getTier().getName() : null,
                user.getTier() != null ? user.getTier().getImageUrl() : null
        );
    }
}
