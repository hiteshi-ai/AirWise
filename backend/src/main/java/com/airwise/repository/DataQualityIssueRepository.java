package com.airwise.repository;

import com.airwise.entity.DataQualityIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataQualityIssueRepository extends JpaRepository<DataQualityIssue, Long> {
    List<DataQualityIssue> findByStationIdOrderByDetectedAtDesc(Long stationId);
    List<DataQualityIssue> findByResolvedFalseOrderByDetectedAtDesc();
    long countByResolvedFalse();
}

