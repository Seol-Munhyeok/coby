package com.example.coby.service;

import com.example.coby.dto.ChangeNicknameRequest;
import com.example.coby.dto.ChangeNicknameResponse;
import com.example.coby.dto.NicknameCheckResponse;
import com.example.coby.entity.User;
import com.example.coby.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
        boolean duplicate = userRepository.existsByNickname(request.newNickname());
        if (duplicate) {
            return new ChangeNicknameResponse(false, "이미 사용 중인 닉네임입니다.");
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));
        user.changeNickname(request.newNickname());

        return new ChangeNicknameResponse(true, "닉네임이 성공적으로 변경되었습니다.");
    }
}
