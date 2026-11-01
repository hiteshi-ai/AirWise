package com.airwise.repository;

import com.airwise.entity.DataSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DataSyncLogRepository extends JpaRepository<DataSyncLog, Long> {
    List<DataSyncLog> findTop20ByOrderBySyncStartTimeDesc();
    Optional<DataSyncLog> findFirstByOrderBySyncStartTimeDesc();
}

