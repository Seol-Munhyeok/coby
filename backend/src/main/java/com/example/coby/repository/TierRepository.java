package com.example.coby.repository;

import com.example.coby.entity.Tier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TierRepository extends JpaRepository<Tier, Integer> {
    Optional<Tier> findByName(String tierName);
}
