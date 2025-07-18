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

    @Column(length = 50, unique = true, nullable = false)
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


    private int reportCount;


    @ManyToOne
    @Setter
    @JoinColumn(name = "tier_id")
    private Tier tier;


    private int tierPoint;

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
        return user;
    }

    public void changeNickname(String newNickname) {
        this.nickname = newNickname;
    }

}

