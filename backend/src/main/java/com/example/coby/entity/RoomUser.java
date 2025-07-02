package com.example.coby.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(RoomUserId.class)
public class RoomUser {
    @Id
    private Long roomId;

    @Id
    private Long userId;

    private boolean isHost;
}
