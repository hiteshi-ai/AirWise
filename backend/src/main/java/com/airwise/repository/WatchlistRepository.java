package com.airwise.repository;

import com.airwise.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUserIdOrderByAddedAtDesc(Long userId);
    Optional<Watchlist> findByUserIdAndStationId(Long userId, Long stationId);
    boolean existsByUserIdAndStationId(Long userId, Long stationId);
    void deleteByUserIdAndStationId(Long userId, Long stationId);
}

