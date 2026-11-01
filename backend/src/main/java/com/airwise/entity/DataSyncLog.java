package com.airwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "data_sync_logs")
public class DataSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String dataSourceCode;

    @Column(nullable = false)
    private LocalDateTime syncStartTime;

    private LocalDateTime syncEndTime;

    @Column(nullable = false, length = 30)
    private String status; // SUCCESS, PARTIAL, FAILED

    private int recordsRetrieved;
    private int recordsStored;

    @Column(length = 2000)
    private String details;

    @Column(length = 50)
    private String triggeredBy = "SYSTEM_SCHEDULER"; // SYSTEM_SCHEDULER, ADMIN_MANUAL

    public DataSyncLog() {}

    public DataSyncLog(String dataSourceCode, LocalDateTime syncStartTime, String status, int recordsRetrieved, int recordsStored, String details, String triggeredBy) {
        this.dataSourceCode = dataSourceCode;
        this.syncStartTime = syncStartTime;
        this.status = status;
        this.recordsRetrieved = recordsRetrieved;
        this.recordsStored = recordsStored;
        this.details = details;
        this.triggeredBy = triggeredBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDataSourceCode() { return dataSourceCode; }
    public void setDataSourceCode(String dataSourceCode) { this.dataSourceCode = dataSourceCode; }

    public LocalDateTime getSyncStartTime() { return syncStartTime; }
    public void setSyncStartTime(LocalDateTime syncStartTime) { this.syncStartTime = syncStartTime; }

    public LocalDateTime getSyncEndTime() { return syncEndTime; }
    public void setSyncEndTime(LocalDateTime syncEndTime) { this.syncEndTime = syncEndTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getRecordsRetrieved() { return recordsRetrieved; }
    public void setRecordsRetrieved(int recordsRetrieved) { this.recordsRetrieved = recordsRetrieved; }

    public int getRecordsStored() { return recordsStored; }
    public void setRecordsStored(int recordsStored) { this.recordsStored = recordsStored; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }
}

