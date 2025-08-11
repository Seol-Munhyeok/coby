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

    @Column(name = "testcase_s3_path")
    private String testcaseS3Path;

    @Column(name = "result_s3_path")
    private String resultS3Path;

    @ManyToOne
    @JoinColumn(name = "difficulty_id")
    private Difficulty difficulty;
}
