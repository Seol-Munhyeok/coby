package com.example.coby.repository;

import com.example.coby.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Long> {
    // 룸 ID로 current_part를 직접 업데이트하는 메소드
    @Modifying
    @Query("update Room r set r.currentPart = :newCount where r.id = :roomId")
    void updateCurrentPart(@Param("newCount") int newCount, @Param("roomId") Long roomId);
}