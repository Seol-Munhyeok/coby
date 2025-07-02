package com.example.coby.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
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
    @JoinColumn(name = "tier_id")
    private Tier tier;

    private int tierPoint;
}
