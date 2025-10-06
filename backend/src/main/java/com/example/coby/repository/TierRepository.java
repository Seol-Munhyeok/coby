package com.example.coby.repository;

import com.example.coby.entity.Tier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TierRepository extends JpaRepository<Tier, Integer> {
    Optional<Tier> findByName(String tierName);
    // 주어진 포인트가 포함된 티어 구간 조회 (예: pointMin ≤ point ≤ pointMax)
    Optional<Tier> findFirstByPointMinLessThanEqualAndPointMaxGreaterThanEqual(int minPoint, int maxPoint);

    // 일치하는 구간이 없을 때, 주어진 포인트 이하 중 가장 높은 구간 조회 (폴백용)
    Optional<Tier> findFirstByPointMinLessThanEqualOrderByPointMinDesc(int point);
}
