package com.airwise.repository;

import com.airwise.entity.ResearcherApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResearcherApplicationRepository extends JpaRepository<ResearcherApplication, Long> {
    List<ResearcherApplication> findByStatusOrderByAppliedAtDesc(String status);
    Optional<ResearcherApplication> findByUserId(Long userId);
    List<ResearcherApplication> findAllByOrderByAppliedAtDesc();
}

