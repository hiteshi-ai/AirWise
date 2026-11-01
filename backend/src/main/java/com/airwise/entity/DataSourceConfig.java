package com.airwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "data_source_configs")
public class DataSourceConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sourceCode;

    @Column(nullable = false, length = 150)
    private String sourceName;

    @Column(nullable = false, length = 500)
    private String endpointUrl;

    private boolean apiKeyRequired = false;

    @Column(length = 200)
    private String apiKey;

    private boolean active = true;

    private Integer updateIntervalMinutes = 30;

    private LocalDateTime lastSuccessfulSync;

    @Column(length = 50)
    private String lastSyncStatus = "INITIALIZED"; // SUCCESS, PARTIAL, FAILED, RUNNING

    @Column(length = 500)
    private String termsAndAttribution;

    public DataSourceConfig() {}

    public DataSourceConfig(String sourceCode, String sourceName, String endpointUrl, boolean apiKeyRequired, String termsAndAttribution) {
        this.sourceCode = sourceCode;
        this.sourceName = sourceName;
        this.endpointUrl = endpointUrl;
        this.apiKeyRequired = apiKeyRequired;
        this.termsAndAttribution = termsAndAttribution;
        this.active = true;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }

    public String getEndpointUrl() { return endpointUrl; }
    public void setEndpointUrl(String endpointUrl) { this.endpointUrl = endpointUrl; }

    public boolean isApiKeyRequired() { return apiKeyRequired; }
    public void setApiKeyRequired(boolean apiKeyRequired) { this.apiKeyRequired = apiKeyRequired; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Integer getUpdateIntervalMinutes() { return updateIntervalMinutes; }
    public void setUpdateIntervalMinutes(Integer updateIntervalMinutes) { this.updateIntervalMinutes = updateIntervalMinutes; }

    public LocalDateTime getLastSuccessfulSync() { return lastSuccessfulSync; }
    public void setLastSuccessfulSync(LocalDateTime lastSuccessfulSync) { this.lastSuccessfulSync = lastSuccessfulSync; }

    public String getLastSyncStatus() { return lastSyncStatus; }
    public void setLastSyncStatus(String lastSyncStatus) { this.lastSyncStatus = lastSyncStatus; }

    public String getTermsAndAttribution() { return termsAndAttribution; }
    public void setTermsAndAttribution(String termsAndAttribution) { this.termsAndAttribution = termsAndAttribution; }
}

