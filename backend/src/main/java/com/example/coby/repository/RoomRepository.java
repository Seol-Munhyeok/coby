package com.example.coby.repository;

import com.example.coby.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface RoomRepository extends JpaRepository<Room, Long> {
    // 룸 ID로 current_part를 직접 업데이트하는 메소드
    @Modifying
    @Query("update Room r set r.currentPart = :newCount where r.id = :roomId")
    void updateCurrentPart(@Param("newCount") int newCount, @Param("roomId") Long roomId);

    @Modifying
    @Query("update Room r set r.winnerId = :winnerId, r.finishedAt = :finishedAt, r.status = :status where r.id = :roomId")
    void updateWinnerAndFinish(@Param("roomId") Long roomId,
                               @Param("winnerId") Long winnerId,
                               @Param("finishedAt") LocalDateTime finishedAt,
                               @Param("status") int status);

}