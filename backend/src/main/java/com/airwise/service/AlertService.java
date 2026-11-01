package com.airwise.service;

import com.airwise.entity.AlertSubscription;
import com.airwise.entity.MonitoringStation;
import com.airwise.entity.Watchlist;
import com.airwise.repository.AlertSubscriptionRepository;
import com.airwise.repository.MonitoringStationRepository;
import com.airwise.repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlertService {

    private final WatchlistRepository watchlistRepository;
    private final AlertSubscriptionRepository alertSubscriptionRepository;
    private final MonitoringStationRepository stationRepository;

    public AlertService(WatchlistRepository watchlistRepository,
                        AlertSubscriptionRepository alertSubscriptionRepository,
                        MonitoringStationRepository stationRepository) {
        this.watchlistRepository = watchlistRepository;
        this.alertSubscriptionRepository = alertSubscriptionRepository;
        this.stationRepository = stationRepository;
    }

    public List<Watchlist> getUserWatchlist(Long userId) {
        return watchlistRepository.findByUserIdOrderByAddedAtDesc(userId);
    }

    @Transactional
    public Watchlist addToWatchlist(Long userId, Long stationId) {
        if (watchlistRepository.existsByUserIdAndStationId(userId, stationId)) {
            return watchlistRepository.findByUserIdAndStationId(userId, stationId).orElse(null);
        }
        MonitoringStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found."));

        Watchlist item = new Watchlist(userId, stationId, station.getCity(), station.getStationName());
        return watchlistRepository.save(item);
    }

    @Transactional
    public void removeFromWatchlist(Long userId, Long stationId) {
        watchlistRepository.findByUserIdAndStationId(userId, stationId)
                .ifPresent(watchlistRepository::delete);
    }

    public List<AlertSubscription> getUserAlerts(Long userId) {
        return alertSubscriptionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public AlertSubscription createAlert(Long userId, Long stationId, String category, Integer thresholdAqi, String pollutant, Double pollutantThreshold) {
        String city = null;
        if (stationId != null) {
            city = stationRepository.findById(stationId).map(MonitoringStation::getCity).orElse(null);
        }
        AlertSubscription sub = new AlertSubscription(userId, stationId, city, category, thresholdAqi);
        sub.setPollutantCode(pollutant);
        sub.setPollutantThreshold(pollutantThreshold);
        return alertSubscriptionRepository.save(sub);
    }

    @Transactional
    public void deleteAlert(Long alertId, Long userId) {
        alertSubscriptionRepository.findById(alertId).ifPresent(sub -> {
            if (sub.getUserId().equals(userId)) {
                alertSubscriptionRepository.delete(sub);
            }
        });
    }
}

