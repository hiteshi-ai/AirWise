package com.airwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "data_quality_issues")
public class DataQualityIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long stationId;

    @Column(length = 20)
    private String pollutantCode;

    @Column(nullable = false, length = 50)
    private String issueType; // MISSING_OBSERVATION, OUTLIER_VALUE, DELAYED_DATA, INSUFFICIENT_PARAMETERS

    @Column(nullable = false, length = 20)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(length = 500)
    private String description;

    private LocalDateTime detectedAt = LocalDateTime.now();

    private boolean resolved = false;

    public DataQualityIssue() {}

    public DataQualityIssue(Long stationId, String pollutantCode, String issueType, String severity, String description) {
        this.stationId = stationId;
        this.pollutantCode = pollutantCode;
        this.issueType = issueType;
        this.severity = severity;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }

    public String getPollutantCode() { return pollutantCode; }
    public void setPollutantCode(String pollutantCode) { this.pollutantCode = pollutantCode; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDetectedAt() { return detectedAt; }
    public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }
}

