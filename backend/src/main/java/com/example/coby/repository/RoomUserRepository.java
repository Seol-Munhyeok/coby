package com.example.coby.repository;

import com.example.coby.entity.RoomUser;
import com.example.coby.entity.RoomUserId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomUserRepository extends JpaRepository<RoomUser, RoomUserId> {
    List<RoomUser> findByRoomId(Long roomId);
}