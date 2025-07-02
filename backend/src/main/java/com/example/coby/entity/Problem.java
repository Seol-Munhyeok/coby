package com.example.coby.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Lob
    private String content;

    private int timeLimit;  // ms

    private int memoryLimit;  // MB

    @ManyToOne
    @JoinColumn(name = "difficulty_id")
    private Difficulty difficulty;
}
