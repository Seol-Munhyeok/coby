package com.example.coby.repository;

import com.example.coby.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByUser_IdAndRoom_Id(Long userId, Long roomId);
    List<Submission> findAllByRoomId(Long roomId);
}
