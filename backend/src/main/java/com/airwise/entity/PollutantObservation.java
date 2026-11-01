package com.airwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pollutant_observations", indexes = {
    @Index(name = "idx_obs_station_time", columnList = "stationId, observationTime"),
    @Index(name = "idx_obs_pollutant", columnList = "pollutantCode")
})
public class PollutantObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long stationId;

    @Column(nullable = false, length = 20)
    private String pollutantCode; // PM2.5, PM10, NO2, SO2, CO, O3, NH3, PB

    @Column(nullable = false)
    private Double measurement;

    @Column(nullable = false, length = 20)
    private String unit; // ug/m3, mg/m3

    @Column(nullable = false)
    private LocalDateTime observationTime;

    @Column(nullable = false)
    private LocalDateTime retrievalTime = LocalDateTime.now();

    @Column(nullable = false, length = 100)
    private String dataSource = "CPCB CAAQMS / data.gov.in";

    @Column(length = 30)
    private String qualityFlag = "VALID"; // VALID, POTENTIAL_OUTLIER, DELAYED, MISSING

    private Integer subIndex; // CPCB Sub-Index for this specific pollutant

    public PollutantObservation() {}

    public PollutantObservation(Long stationId, String pollutantCode, Double measurement, String unit, LocalDateTime observationTime, String dataSource, Integer subIndex) {
        this.stationId = stationId;
        this.pollutantCode = pollutantCode;
        this.measurement = measurement;
        this.unit = unit;
        this.observationTime = observationTime;
        this.dataSource = dataSource;
        this.subIndex = subIndex;
        this.qualityFlag = "VALID";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }

    public String getPollutantCode() { return pollutantCode; }
    public void setPollutantCode(String pollutantCode) { this.pollutantCode = pollutantCode; }

    public Double getMeasurement() { return measurement; }
    public void setMeasurement(Double measurement) { this.measurement = measurement; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDateTime getObservationTime() { return observationTime; }
    public void setObservationTime(LocalDateTime observationTime) { this.observationTime = observationTime; }

    public LocalDateTime getRetrievalTime() { return retrievalTime; }
    public void setRetrievalTime(LocalDateTime retrievalTime) { this.retrievalTime = retrievalTime; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    public String getQualityFlag() { return qualityFlag; }
    public void setQualityFlag(String qualityFlag) { this.qualityFlag = qualityFlag; }

    public Integer getSubIndex() { return subIndex; }
    public void setSubIndex(Integer subIndex) { this.subIndex = subIndex; }
}

