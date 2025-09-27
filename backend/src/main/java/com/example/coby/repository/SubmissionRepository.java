package com.example.coby.repository;

import com.example.coby.entity.submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<submission, Long> {

    /**
     * 특정 방(roomId)에서 특정 사용자(userId)가 제출한 'Accepted' 상태의 제출 중
     * 가장 최근 제출 (Top 1)을 찾습니다.
     * * 이 메서드는 RoomService에서 Room.winnerId (userId)를 기반으로
     * 승자의 코드를 조회하는 데 사용됩니다.
     * * @param roomId 방 ID
     * @param userId 사용자 ID (승자의 ID)
     * @param status 제출 상태 (항상 "Accepted"를 사용)
     * @return 가장 최근 제출을 포함하는 Optional<submission>
     */
    Optional<submission> findTopByRoomIdAndUserIdAndStatusOrderByCreatedAtDesc(
            Long roomId,
            Long userId,
            String status
    );
}