package com.example.coby.repository;

import com.example.coby.entity.RoomUser;
import com.example.coby.entity.RoomUserId;
import org.springframework.data.jpa.repository.JpaRepository;
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
}