package com.airwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "official_aqi_records", indexes = {
    @Index(name = "idx_aqi_station_time", columnList = "stationId, observationTime"),
    @Index(name = "idx_aqi_category", columnList = "aqiCategory")
})
public class OfficialAqiRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long stationId;

    private Integer aqiValue; // 0-500, or null if insufficient data

    @Column(nullable = false, length = 30)
    private String aqiCategory; // Good, Satisfactory, Moderate, Poor, Very Poor, Severe, Insufficient Data

    @Column(length = 20)
    private String prominentPollutant;

    @Column(nullable = false)
    private LocalDateTime observationTime;

    @Column(nullable = false)
    private LocalDateTime retrievalTime = LocalDateTime.now();

    private boolean officialCpcb = true;

    @Column(length = 100)
    private String methodology = "CPCB National Air Quality Index (IND-AQI)";

    public OfficialAqiRecord() {}

    public OfficialAqiRecord(Long stationId, Integer aqiValue, String aqiCategory, String prominentPollutant, LocalDateTime observationTime, boolean officialCpcb) {
        this.stationId = stationId;
        this.aqiValue = aqiValue;
        this.aqiCategory = aqiCategory;
        this.prominentPollutant = prominentPollutant;
        this.observationTime = observationTime;
        this.officialCpcb = officialCpcb;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }

    public Integer getAqiValue() { return aqiValue; }
    public void setAqiValue(Integer aqiValue) { this.aqiValue = aqiValue; }

    public String getAqiCategory() { return aqiCategory; }
    public void setAqiCategory(String aqiCategory) { this.aqiCategory = aqiCategory; }

    public String getProminentPollutant() { return prominentPollutant; }
    public void setProminentPollutant(String prominentPollutant) { this.prominentPollutant = prominentPollutant; }

    public LocalDateTime getObservationTime() { return observationTime; }
    public void setObservationTime(LocalDateTime observationTime) { this.observationTime = observationTime; }

    public LocalDateTime getRetrievalTime() { return retrievalTime; }
    public void setRetrievalTime(LocalDateTime retrievalTime) { this.retrievalTime = retrievalTime; }

    public boolean isOfficialCpcb() { return officialCpcb; }
    public void setOfficialCpcb(boolean officialCpcb) { this.officialCpcb = officialCpcb; }

    public String getMethodology() { return methodology; }
    public void setMethodology(String methodology) { this.methodology = methodology; }
}

