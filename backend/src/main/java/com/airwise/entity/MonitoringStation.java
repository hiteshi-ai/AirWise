package com.airwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "monitoring_stations", indexes = {
    @Index(name = "idx_station_city", columnList = "city"),
    @Index(name = "idx_station_state", columnList = "state"),
    @Index(name = "idx_station_code", columnList = "stationCode")
})
public class MonitoringStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String stationCode;

    @Column(nullable = false, length = 150)
    private String stationName;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false, length = 80)
    private String state;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 60)
    private String stationType = "CAAQMS"; // CAAQMS or MANUAL

    @Column(length = 150)
    private String agency = "CPCB / SPCB";

    @Column(length = 30)
    private String status = "OPERATIONAL"; // OPERATIONAL, DELAYED, MAINTENANCE, INACTIVE

    private LocalDateTime lastReportedAt;
    private LocalDateTime createdAt = LocalDateTime.now();

    public MonitoringStation() {}

    public MonitoringStation(String stationCode, String stationName, String city, String state, Double latitude, Double longitude, String agency) {
        this.stationCode = stationCode;
        this.stationName = stationName;
        this.city = city;
        this.state = state;
        this.latitude = latitude;
        this.longitude = longitude;
        this.agency = agency;
        this.status = "OPERATIONAL";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStationCode() { return stationCode; }
    public void setStationCode(String stationCode) { this.stationCode = stationCode; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getStationType() { return stationType; }
    public void setStationType(String stationType) { this.stationType = stationType; }

    public String getAgency() { return agency; }
    public void setAgency(String agency) { this.agency = agency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getLastReportedAt() { return lastReportedAt; }
    public void setLastReportedAt(LocalDateTime lastReportedAt) { this.lastReportedAt = lastReportedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

