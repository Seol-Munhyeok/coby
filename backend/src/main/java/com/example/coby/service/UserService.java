package com.example.coby.service;

import com.example.coby.dto.*;
import com.example.coby.entity.User;
import com.example.coby.repository.UserRepository;
import com.example.coby.security.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<RankingDto> Rankings() {
        List<User> users = userRepository.findAll(Sort.by(Order.desc("tierPoint")));
        return users.stream()
                .map(RankingDto::fromEntity)
                .toList();
    }

    public UserProfileResponse getUserProfile(long userId) {
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

    public NicknameCheckResponse checkNickname(String nickname) {
        boolean exists = userRepository.existsByNickname(nickname);
        if (exists) {
            return new NicknameCheckResponse(false, "이미 사용 중인 닉네임입니다.");
        } else {
            return new NicknameCheckResponse(true, "사용 가능한 닉네임입니다.");
        }
    }

    @Transactional
    public ChangeNicknameResponse changeNickname(ChangeNicknameRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomOAuth2User principal = (CustomOAuth2User) auth.getPrincipal();
        Long userId = principal.getUserId();

        boolean duplicate = userRepository.existsByNickname(request.nickname());
        if (duplicate) {
            return new ChangeNicknameResponse(false, "이미 사용 중인 닉네임입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));
        user.changeNickname(request.nickname());

        if (request.selectedLanguage() != null && !request.selectedLanguage().isBlank()) {
            user.changePreferredLanguage(request.selectedLanguage());
        }

        System.out.println("🧾 변경 전 nickname: " + user.getNickname());
        System.out.println("📝 요청된 nickname: " + request.nickname());

        return new ChangeNicknameResponse(true, "닉네임이 성공적으로 변경되었습니다.");
    }
}
