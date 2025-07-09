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
public class Tier {
    @Id
    private Integer id;

    private String name;

    private String imageUrl;

    private int pointMin;

    private int pointMax;
}

