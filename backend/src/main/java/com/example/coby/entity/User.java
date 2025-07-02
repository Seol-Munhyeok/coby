package com.example.coby.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String provider;     // google, kakao 등
    private String providerId;   // 구글 사용자 고유 ID
    private String nickname;     // 구글 이름
}
