package com.airwise.repository;

import com.airwise.entity.DataSourceConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DataSourceConfigRepository extends JpaRepository<DataSourceConfig, Long> {
    Optional<DataSourceConfig> findBySourceCode(String sourceCode);
}

