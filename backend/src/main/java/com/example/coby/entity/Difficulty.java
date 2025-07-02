package com.example.coby.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Difficulty {
    @Id
    private Integer id;

    private String label;

    private int rewardPoint;
}
