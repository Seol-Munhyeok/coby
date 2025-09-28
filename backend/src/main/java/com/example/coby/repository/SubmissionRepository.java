package com.example.coby.repository;

import com.example.coby.entity.submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<submission, Long> {
    Optional<submission> findByUser_IdAndRoom_Id(Long userId, Long roomId);

}
