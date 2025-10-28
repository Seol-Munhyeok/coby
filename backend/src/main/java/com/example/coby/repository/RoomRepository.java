package com.example.coby.repository;

import com.example.coby.entity.Room;
import com.example.coby.entity.RoomStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    // 룸 ID로 current_part를 직접 업데이트하는 메소드
    @Modifying
    @Query("update Room r set r.currentPart = :newCount where r.id = :roomId")
    void updateCurrentPart(@Param("newCount") int newCount, @Param("roomId") Long roomId);

    @Modifying
    @Query("update Room r set r.winnerId = :winnerId, r.submittedAt = :submittedAt, r.status = :status where r.id = :roomId")
    void updateWinnerAndFinish(@Param("roomId") Long roomId,
                               @Param("winnerId") Long winnerId,
                               @Param("submittedAt") LocalDateTime submittedAt,
                               @Param("status") RoomStatus status);


    @Lock(LockModeType.PESSIMISTIC_WRITE) // 쓰기 락
    @Query("SELECT r FROM Room r WHERE r.id = :roomId")
    Optional<Room> findByIdForUpdate(@Param("roomId") Long roomId);

    List<Room> findByStatusNot(RoomStatus status);
}