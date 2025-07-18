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

    private String roomName;              // room_name

    private String title;

    private int maxParticipants;          // max_participants

    @Column(nullable = false)
    private int currentPart;              // current_part

    private String difficulty;            // difficulty

    private String timeLimit;             // time_limit

    @Column(nullable = false)
    private boolean isPrivate;            // is_private

    private String password;              // password

    @Column(nullable = false)
    private boolean itemMode;             // item_mode

    private String language;              // language

    private LocalDateTime createdAt;      // created_at

    @Column(nullable = false)
    private int status;                   // status (0: 대기, 1: 진행, 2: 결과)

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;              // problem_id

    @Column(unique = true)
    private String joinCode;              // join_code

    @Column(nullable = false)
    private int currentCapacity = 0;      // current_capacity

    @Column(nullable = false)
    private int maxCapacity = 4;          // ✅ DB에 존재하므로 필수 추가
}
