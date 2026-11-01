package com.airwise.repository;

import com.airwise.entity.AlertSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertSubscriptionRepository extends JpaRepository<AlertSubscription, Long> {
    List<AlertSubscription> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AlertSubscription> findByActiveTrue();
}

