package com.airwise.repository;

import com.airwise.entity.MonitoringStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonitoringStationRepository extends JpaRepository<MonitoringStation, Long> {
    Optional<MonitoringStation> findByStationCode(String stationCode);
    List<MonitoringStation> findByCityIgnoreCase(String city);
    List<MonitoringStation> findByStateIgnoreCase(String state);
    List<MonitoringStation> findByStatus(String status);

    @Query("SELECT DISTINCT s.state FROM MonitoringStation s ORDER BY s.state ASC")
    List<String> findDistinctStates();

    @Query("SELECT DISTINCT s.city FROM MonitoringStation s WHERE LOWER(s.state) = LOWER(:state) ORDER BY s.city ASC")
    List<String> findCitiesByState(String state);

    @Query("SELECT DISTINCT s.city FROM MonitoringStation s ORDER BY s.city ASC")
    List<String> findAllCities();
}

