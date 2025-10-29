package com.example.coby.repository;

import com.example.coby.entity.Room;
import com.example.coby.entity.RoomUser;
import com.example.coby.entity.RoomUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface RoomUserRepository extends JpaRepository<RoomUser, RoomUserId> {
    List<RoomUser> findByRoomId(Long roomId);
    long countByRoomId(Long roomId);

    Optional<RoomUser> findByRoomIdAndIsHostTrue(Long roomId);

    // 이 메소드는 roomId에 해당하는 RoomUser를 모두 삭제합니다.
    @Transactional
    void deleteAllByRoomId(Long roomId);

    @Query("SELECT r FROM RoomUser ru JOIN Room r ON ru.roomId = r.id WHERE ru.userId = :userId AND r.status = 'RESULT'")
    List<Room> findResultRoomsByUserId(@Param("userId") Long userId);
}