package com.example.coby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomName;              // room_name

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

    @CreatedDate
    private LocalDateTime createdAt;      // created_at

    @Column
    private LocalDateTime startAt;        // start_at

    @Column
    private LocalDateTime expireAt;       // expire_at


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoomStatus status = RoomStatus.WAITING;                   // status (0: 대기, 1: 진행, 2: 결과)

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;              // problem_id

    @Column(nullable = false)
    private int maxCapacity = 4;

    @Column(nullable = true)
    private Long winnerId;

    @Column(nullable = true)
    private LocalDateTime submittedAt;
}
