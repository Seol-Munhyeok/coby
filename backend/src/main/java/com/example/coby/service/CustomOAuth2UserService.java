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
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        try {
            OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(request);
            String provider = request.getClientRegistration().getRegistrationId(); // "google" or "kakao"

            String email = null;
            String nickname;
            String providerId;

            if ("kakao".equals(provider)) {
                Map<String, Object> attributes = oAuth2User.getAttributes();
                Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

                email = (String) kakaoAccount.get("email");
                nickname = profile != null ? (String) profile.get("nickname") : "사용자";
                providerId = String.valueOf(attributes.get("id"));
            } else if ("google".equals(provider)) {
                email = oAuth2User.getAttribute("email");
                nickname = oAuth2User.getAttribute("name");
                providerId = oAuth2User.getAttribute("sub");
            } else {
                throw new IllegalArgumentException("지원하지 않는 OAuth 제공자입니다: " + provider);
            }

            // ✅ 람다 내부 사용을 위한 final 변수로 wrapping
            final String fProvider = provider;
            final String fProviderId = providerId;
            final String fEmail = email;
            final String fNickname = nickname != null ? nickname : "사용자";

            User user = userRepository.findBySsoProviderAndProviderId(fProvider, fProviderId)
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .ssoProvider(fProvider)
                                    .providerId(fProviderId)
                                    .email(fEmail)
                                    .nickname(fNickname)
                                    .build()
                    ));

            String nameAttributeKey = switch (provider) {
                case "google" -> "sub";
                case "kakao" -> "id";
                default -> throw new IllegalArgumentException("지원하지 않는 provider: " + provider);
            };

            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                    oAuth2User.getAttributes(),
                    nameAttributeKey
            );

        } catch (Exception e) {
            e.printStackTrace();
            OAuth2Error error = new OAuth2Error("oauth2_processing_error", "OAuth2 로그인 처리 실패: " + e.getMessage(), null);
            throw new OAuth2AuthenticationException(error);
        }
    }
}
