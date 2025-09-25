package com.example.coby.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, unique = true)
    private String nickname;

    @Column(length = 50)
    private String email;


    @Column(length = 10, nullable = false)
    private String ssoProvider;


    @Column(length = 255, nullable = false)
    private String providerId;


    private LocalDateTime createdAt;


    private LocalDateTime lastLoginAt;


    @Column(length = 50)
    private String preferredLanguage;


    private Integer reportCount;  // 누적 신고 수

    @Column(nullable = false)
    private Integer totalGame = 0;

    @Column(nullable = false)
    private Integer winGame = 0;

    @ManyToOne
    @Setter
    @JoinColumn(name = "tier_id")
    private Tier tier;

    private Integer tierPoint;

    public static User createSocialUser(String nickname, String email, String provider, String providerId, Tier tier) {
        User user = new User();
        user.nickname = nickname;
        user.email = email;
        user.ssoProvider = provider;
        user.providerId = providerId;
        user.createdAt = LocalDateTime.now();
        user.reportCount = 0;
        user.tierPoint = 0;
        user.tier = tier;

        user.totalGame = 0;
        user.winGame = 0;

        return user;
    }

    public void changeNickname(String newNickname) {
        this.nickname = newNickname;
    }

    public void changePreferredLanguage(String language) {
        this.preferredLanguage = language;
    }


}

