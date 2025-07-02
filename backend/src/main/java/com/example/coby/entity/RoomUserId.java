package com.example.coby.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUserId implements Serializable {
    private Long roomId;
    private Long userId;
}
