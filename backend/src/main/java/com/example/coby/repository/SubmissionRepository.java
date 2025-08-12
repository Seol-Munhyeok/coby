package com.example.coby.repository;

import com.example.coby.entity.submission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<submission, Long> {
}
