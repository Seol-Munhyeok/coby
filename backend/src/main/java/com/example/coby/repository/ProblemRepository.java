package com.example.coby.repository;

import com.example.coby.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findByDifficulty_Label(String label);
}
