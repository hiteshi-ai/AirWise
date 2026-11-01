package com.airwise.repository;

import com.airwise.entity.PollutantObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PollutantObservationRepository extends JpaRepository<PollutantObservation, Long> {
    List<PollutantObservation> findByStationIdAndObservationTimeBetweenOrderByObservationTimeAsc(
            Long stationId, LocalDateTime start, LocalDateTime end);

    List<PollutantObservation> findByStationIdAndPollutantCodeAndObservationTimeBetweenOrderByObservationTimeAsc(
            Long stationId, String pollutantCode, LocalDateTime start, LocalDateTime end);

    @Query("SELECT o FROM PollutantObservation o WHERE o.stationId = :stationId AND o.observationTime = " +
           "(SELECT MAX(o2.observationTime) FROM PollutantObservation o2 WHERE o2.stationId = :stationId AND o2.pollutantCode = o.pollutantCode)")
    List<PollutantObservation> findLatestObservationsForStation(@Param("stationId") Long stationId);

    @Query("SELECT o FROM PollutantObservation o WHERE o.stationId IN :stationIds AND o.observationTime >= :since ORDER BY o.observationTime DESC")
    List<PollutantObservation> findRecentObservationsForStations(@Param("stationIds") List<Long> stationIds, @Param("since") LocalDateTime since);

    long countByObservationTimeAfter(LocalDateTime timestamp);
}

