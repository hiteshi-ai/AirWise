package com.airwise.controller;

import com.airwise.entity.AlertSubscription;
import com.airwise.entity.User;
import com.airwise.entity.Watchlist;
import com.airwise.repository.UserRepository;
import com.airwise.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citizen")
public class CitizenController {

    private final AlertService alertService;
    private final UserRepository userRepository;

    public CitizenController(AlertService alertService, UserRepository userRepository) {
        this.alertService = alertService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new SecurityException("Authenticated user not found."));
    }

    @GetMapping("/watchlist")
    public ResponseEntity<List<Watchlist>> getWatchlist(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(alertService.getUserWatchlist(user.getId()));
    }

    @PostMapping("/watchlist/{stationId}")
    public ResponseEntity<Watchlist> addToWatchlist(Authentication auth, @PathVariable Long stationId) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(alertService.addToWatchlist(user.getId(), stationId));
    }

    @DeleteMapping("/watchlist/{stationId}")
    public ResponseEntity<?> removeFromWatchlist(Authentication auth, @PathVariable Long stationId) {
        User user = getAuthenticatedUser(auth);
        alertService.removeFromWatchlist(user.getId(), stationId);
        return ResponseEntity.ok(Map.of("message", "Station removed from watchlist."));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<AlertSubscription>> getAlerts(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(alertService.getUserAlerts(user.getId()));
    }

    @PostMapping("/alerts")
    public ResponseEntity<AlertSubscription> createAlert(Authentication auth, @RequestBody Map<String, Object> body) {
        User user = getAuthenticatedUser(auth);
        Long stationId = body.get("stationId") != null ? Long.valueOf(body.get("stationId").toString()) : null;
        String category = (String) body.getOrDefault("thresholdCategory", "Poor");
        Integer aqiValue = body.get("thresholdAqiValue") != null ? Integer.valueOf(body.get("thresholdAqiValue").toString()) : 201;
        String pollutant = (String) body.get("pollutantCode");
        Double pollutantThreshold = body.get("pollutantThreshold") != null ? Double.valueOf(body.get("pollutantThreshold").toString()) : null;

        AlertSubscription alert = alertService.createAlert(user.getId(), stationId, category, aqiValue, pollutant, pollutantThreshold);
        return ResponseEntity.ok(alert);
    }

    @DeleteMapping("/alerts/{alertId}")
    public ResponseEntity<?> deleteAlert(Authentication auth, @PathVariable Long alertId) {
        User user = getAuthenticatedUser(auth);
        alertService.deleteAlert(alertId, user.getId());
        return ResponseEntity.ok(Map.of("message", "Alert subscription removed."));
    }
}

