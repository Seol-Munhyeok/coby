package com.example.coby.repository;

import com.example.coby.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findBySsoProviderAndProviderId(String provider, String providerId);
}
