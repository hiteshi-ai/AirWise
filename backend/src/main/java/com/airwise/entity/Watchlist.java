package com.airwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_watchlists", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "stationId"})
})
public class Watchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long stationId;

    @Column(length = 80)
    private String cityName;

    @Column(length = 150)
    private String stationName;

    private LocalDateTime addedAt = LocalDateTime.now();

    public Watchlist() {}

    public Watchlist(Long userId, Long stationId, String cityName, String stationName) {
        this.userId = userId;
        this.stationId = stationId;
        this.cityName = cityName;
        this.stationName = stationName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}

