package com.airwise.repository;

import com.airwise.entity.OfficialAqiRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfficialAqiRecordRepository extends JpaRepository<OfficialAqiRecord, Long> {
    Optional<OfficialAqiRecord> findFirstByStationIdOrderByObservationTimeDesc(Long stationId);

    List<OfficialAqiRecord> findByStationIdAndObservationTimeBetweenOrderByObservationTimeAsc(
            Long stationId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT r FROM OfficialAqiRecord r WHERE r.id IN (" +
           "SELECT MAX(r2.id) FROM OfficialAqiRecord r2 GROUP BY r2.stationId)")
    List<OfficialAqiRecord> findLatestAqiForEveryStation();

    @Query("SELECT r FROM OfficialAqiRecord r WHERE r.stationId IN :stationIds AND r.id IN (" +
           "SELECT MAX(r2.id) FROM OfficialAqiRecord r2 WHERE r2.stationId IN :stationIds GROUP BY r2.stationId)")
    List<OfficialAqiRecord> findLatestAqiForStationIds(@Param("stationIds") List<Long> stationIds);

    @Query("SELECT MAX(r.observationTime) FROM OfficialAqiRecord r")
    Optional<LocalDateTime> findLatestObservationTime();
}

