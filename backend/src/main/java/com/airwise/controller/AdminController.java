package com.airwise.controller;

import com.airwise.entity.*;
import com.airwise.repository.*;
import com.airwise.service.AdminService;
import com.airwise.service.DataSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final DataSyncService dataSyncService;
    private final UserRepository userRepository;
    private final ResearcherApplicationRepository applicationRepository;
    private final MonitoringStationRepository stationRepository;
    private final DataQualityIssueRepository qualityIssueRepository;
    private final DataSyncLogRepository syncLogRepository;

    public AdminController(AdminService adminService,
                           DataSyncService dataSyncService,
                           UserRepository userRepository,
                           ResearcherApplicationRepository applicationRepository,
                           MonitoringStationRepository stationRepository,
                           DataQualityIssueRepository qualityIssueRepository,
                           DataSyncLogRepository syncLogRepository) {
        this.adminService = adminService;
        this.dataSyncService = dataSyncService;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.stationRepository = stationRepository;
        this.qualityIssueRepository = qualityIssueRepository;
        this.syncLogRepository = syncLogRepository;
    }

    private User getAuthenticatedAdmin(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new SecurityException("Admin user not found."));
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getAdminOverview(Authentication auth) {
        User admin = getAuthenticatedAdmin(auth);

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("adminRole", admin.getRole().name());
        overview.put("adminEmail", admin.getEmail());
        overview.put("stateScope", admin.getStateScope());
        overview.put("totalUsers", userRepository.count());
        overview.put("pendingResearcherApplications", applicationRepository.findByStatusOrderByAppliedAtDesc("PENDING").size());
        overview.put("totalStations", stationRepository.count());
        overview.put("activeQualityIssues", qualityIssueRepository.countByResolvedFalse());
        overview.put("lastSync", syncLogRepository.findFirstByOrderBySyncStartTimeDesc().orElse(null));
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(Authentication auth) {
        User admin = getAuthenticatedAdmin(auth);
        return ResponseEntity.ok(adminService.getAllUsers(admin));
    }

    @PostMapping("/create-state-admin")
    public ResponseEntity<?> createStateAdmin(Authentication auth, @RequestBody Map<String, String> body) {
        User admin = getAuthenticatedAdmin(auth);
        String name = body.get("fullName");
        String email = body.get("email");
        String password = body.get("password");
        String stateScope = body.get("stateScope");

        if (name == null || email == null || password == null || stateScope == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields including state scope are required."));
        }

        try {
            User created = adminService.createStateAdmin(name, email, password, stateScope, admin);
            return ResponseEntity.ok(created);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/super/create-central-admin")
    public ResponseEntity<?> createCentralAdmin(Authentication auth, @RequestBody Map<String, String> body) {
        User admin = getAuthenticatedAdmin(auth);
        String name = body.get("fullName");
        String email = body.get("email");
        String password = body.get("password");

        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Full name, email and password are required."));
        }

        try {
            User created = adminService.createCentralAdmin(name, email, password, admin);
            return ResponseEntity.ok(created);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/researcher-applications")
    public ResponseEntity<List<ResearcherApplication>> getApplications(Authentication auth) {
        User admin = getAuthenticatedAdmin(auth);
        return ResponseEntity.ok(adminService.getResearcherApplications(admin));
    }

    @PostMapping("/researcher-applications/{id}/review")
    public ResponseEntity<?> reviewApplication(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User admin = getAuthenticatedAdmin(auth);
        boolean approve = Boolean.parseBoolean(body.getOrDefault("approve", "false").toString());
        String notes = (String) body.getOrDefault("notes", "");

        try {
            ResearcherApplication updated = adminService.reviewResearcherApplication(id, approve, notes, admin);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs(Authentication auth) {
        User admin = getAuthenticatedAdmin(auth);
        return ResponseEntity.ok(adminService.getAuditLogs(admin));
    }

    @GetMapping("/data-quality")
    public ResponseEntity<List<DataQualityIssue>> getDataQualityIssues() {
        return ResponseEntity.ok(adminService.getDataQualityIssues());
    }

    @PostMapping("/data-quality/{id}/resolve")
    public ResponseEntity<?> resolveQualityIssue(Authentication auth, @PathVariable Long id) {
        User admin = getAuthenticatedAdmin(auth);
        try {
            return ResponseEntity.ok(adminService.resolveDataQualityIssue(id, admin));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/data-sources")
    public ResponseEntity<List<DataSourceConfig>> getDataSources() {
        return ResponseEntity.ok(adminService.getAllDataSources());
    }

    @PostMapping("/data-sources/{id}/toggle")
    public ResponseEntity<?> toggleDataSource(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        User admin = getAuthenticatedAdmin(auth);
        boolean active = body.getOrDefault("active", true);
        try {
            return ResponseEntity.ok(adminService.toggleDataSource(id, active, admin));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/sync/trigger")
    public ResponseEntity<DataSyncLog> triggerSync(Authentication auth) {
        User admin = getAuthenticatedAdmin(auth);
        DataSyncLog log = dataSyncService.triggerManualSync(admin.getEmail() + " (" + admin.getRole().name() + ")");
        return ResponseEntity.ok(log);
    }

    @GetMapping("/sync/logs")
    public ResponseEntity<List<DataSyncLog>> getSyncLogs() {
        return ResponseEntity.ok(syncLogRepository.findTop20ByOrderBySyncStartTimeDesc());
    }
}

