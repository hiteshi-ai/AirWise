package com.airwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_subscriptions")
public class AlertSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Long stationId;

    @Column(length = 80)
    private String cityName;

    @Column(nullable = false, length = 30)
    private String thresholdCategory; // Moderate (100+), Poor (200+), Very Poor (300+), Severe (400+)

    private Integer thresholdAqiValue;

    @Column(length = 20)
    private String pollutantCode; // e.g. PM2.5 or null for overall AQI

    private Double pollutantThreshold;

    private boolean emailNotification = true;
    private boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime lastTriggeredAt;

    public AlertSubscription() {}

    public AlertSubscription(Long userId, Long stationId, String cityName, String thresholdCategory, Integer thresholdAqiValue) {
        this.userId = userId;
        this.stationId = stationId;
        this.cityName = cityName;
        this.thresholdCategory = thresholdCategory;
        this.thresholdAqiValue = thresholdAqiValue;
        this.active = true;
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

    public String getThresholdCategory() { return thresholdCategory; }
    public void setThresholdCategory(String thresholdCategory) { this.thresholdCategory = thresholdCategory; }

    public Integer getThresholdAqiValue() { return thresholdAqiValue; }
    public void setThresholdAqiValue(Integer thresholdAqiValue) { this.thresholdAqiValue = thresholdAqiValue; }

    public String getPollutantCode() { return pollutantCode; }
    public void setPollutantCode(String pollutantCode) { this.pollutantCode = pollutantCode; }

    public Double getPollutantThreshold() { return pollutantThreshold; }
    public void setPollutantThreshold(Double pollutantThreshold) { this.pollutantThreshold = pollutantThreshold; }

    public boolean isEmailNotification() { return emailNotification; }
    public void setEmailNotification(boolean emailNotification) { this.emailNotification = emailNotification; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastTriggeredAt() { return lastTriggeredAt; }
    public void setLastTriggeredAt(LocalDateTime lastTriggeredAt) { this.lastTriggeredAt = lastTriggeredAt; }
}

