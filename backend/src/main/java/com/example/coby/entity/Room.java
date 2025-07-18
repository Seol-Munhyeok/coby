package com.example.coby.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomName;

    private int maxParticipants;

    private int currentPart;

    private String difficulty;

    private String timeLimit;

    private boolean isPrivate;

    private String password;

    private boolean itemMode;

    private String language;

    private LocalDateTime createdAt;

    private int status;  // 0: 대기, 1: 진행 중, 2: 결과

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;

    @Column(unique = true)
    private String joinCode;
}
