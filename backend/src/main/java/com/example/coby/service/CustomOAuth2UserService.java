package com.example.coby.service;

import com.example.coby.entity.User;
import com.example.coby.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        try {
            System.out.println(">> loadUser 진입");

            OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(request);

            String provider = request.getClientRegistration().getRegistrationId(); // e.g., "google"
            String providerId = oAuth2User.getName();
            String email = oAuth2User.getAttribute("email");
            String nickname = oAuth2User.getAttribute("name");

            System.out.println("== [OAuth 로그인 정보] ==");
            System.out.println("provider = " + provider);
            System.out.println("providerId = " + providerId);
            System.out.println("email = " + email);
            System.out.println("nickname = " + nickname);

            if (email == null) {
                throw new IllegalArgumentException("Google에서 email 정보를 가져올 수 없습니다.");
            }

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        System.out.println(">> 신규 유저 저장");
                        return userRepository.save(
                                User.builder()
                                        .email(email)
                                        .ssoProvider(provider)
                                        .providerId(providerId)
                                        .nickname(nickname)
                                        .build()
                        );
                    });

            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                    oAuth2User.getAttributes(),
                    "email"
            );
        } catch (Exception e) {
            e.printStackTrace();
            OAuth2Error error = new OAuth2Error("oauth2_processing_error", "OAuth2UserService 실패: " + e.getMessage(), null);
            throw new OAuth2AuthenticationException(error);
        }
    }
}
