package com.airwise.service;

import com.airwise.entity.*;
import com.airwise.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ResearcherApplicationRepository applicationRepository;
    private final MonitoringStationRepository stationRepository;
    private final AuditLogRepository auditLogRepository;
    private final DataQualityIssueRepository qualityIssueRepository;
    private final DataSourceConfigRepository dataSourceConfigRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        ResearcherApplicationRepository applicationRepository,
                        MonitoringStationRepository stationRepository,
                        AuditLogRepository auditLogRepository,
                        DataQualityIssueRepository qualityIssueRepository,
                        DataSourceConfigRepository dataSourceConfigRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.stationRepository = stationRepository;
        this.auditLogRepository = auditLogRepository;
        this.qualityIssueRepository = qualityIssueRepository;
        this.dataSourceConfigRepository = dataSourceConfigRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers(User adminUser) {
        if (adminUser.getRole() == Role.ROLE_STATE_ADMIN) {
            // State Admin only views users within their state scope
            return userRepository.findByStateScope(adminUser.getStateScope());
        }
        return userRepository.findAll();
    }

    @Transactional
    public User createStateAdmin(String fullName, String email, String password, String stateScope, User currentAdmin) {
        if (currentAdmin.getRole() != Role.ROLE_SUPER_ADMIN && currentAdmin.getRole() != Role.ROLE_CENTRAL_ADMIN) {
            throw new SecurityException("Only Super Admin or Central Admin can create State Admin accounts.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with this email already exists.");
        }

        User stateAdmin = new User();
        stateAdmin.setFullName(fullName);
        stateAdmin.setEmail(email.toLowerCase().trim());
        stateAdmin.setPassword(passwordEncoder.encode(password));
        stateAdmin.setRole(Role.ROLE_STATE_ADMIN);
        stateAdmin.setStateScope(stateScope);
        stateAdmin.setStatus("ACTIVE");
        stateAdmin.setEmailVerified(true);
        User saved = userRepository.save(stateAdmin);

        auditLogRepository.save(new AuditLog(
                currentAdmin.getEmail(), currentAdmin.getRole().name(), "CREATE_STATE_ADMIN",
                "User", saved.getId(), "Created State Admin for state: " + stateScope, "127.0.0.1"
        ));
        return saved;
    }

    @Transactional
    public User createCentralAdmin(String fullName, String email, String password, User currentAdmin) {
        if (currentAdmin.getRole() != Role.ROLE_SUPER_ADMIN) {
            throw new SecurityException("Only Super Admin can create Central Admin accounts.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with this email already exists.");
        }

        User centralAdmin = new User();
        centralAdmin.setFullName(fullName);
        centralAdmin.setEmail(email.toLowerCase().trim());
        centralAdmin.setPassword(passwordEncoder.encode(password));
        centralAdmin.setRole(Role.ROLE_CENTRAL_ADMIN);
        centralAdmin.setStatus("ACTIVE");
        centralAdmin.setEmailVerified(true);
        User saved = userRepository.save(centralAdmin);

        auditLogRepository.save(new AuditLog(
                currentAdmin.getEmail(), currentAdmin.getRole().name(), "CREATE_CENTRAL_ADMIN",
                "User", saved.getId(), "Created Central Admin account.", "127.0.0.1"
        ));
        return saved;
    }

    public List<ResearcherApplication> getResearcherApplications(User adminUser) {
        return applicationRepository.findAllByOrderByAppliedAtDesc();
    }

    @Transactional
    public ResearcherApplication reviewResearcherApplication(Long applicationId, boolean approve, String notes, User reviewer) {
        ResearcherApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found."));

        app.setStatus(approve ? "APPROVED" : "REJECTED");
        app.setReviewedByUserId(reviewer.getId());
        app.setReviewerEmail(reviewer.getEmail());
        app.setReviewedAt(LocalDateTime.now());
        app.setReviewerNotes(notes);

        User user = userRepository.findById(app.getUserId()).orElse(null);
        if (user != null) {
            user.setStatus(approve ? "ACTIVE" : "REJECTED");
            userRepository.save(user);
        }

        ResearcherApplication updated = applicationRepository.save(app);

        auditLogRepository.save(new AuditLog(
                reviewer.getEmail(), reviewer.getRole().name(),
                approve ? "APPROVE_RESEARCHER" : "REJECT_RESEARCHER",
                "ResearcherApplication", app.getId(),
                (approve ? "Approved" : "Rejected") + " application for " + app.getEmail() + ". Notes: " + notes,
                "127.0.0.1"
        ));

        return updated;
    }

    public List<AuditLog> getAuditLogs(User adminUser) {
        if (adminUser.getRole() == Role.ROLE_STATE_ADMIN) {
            return auditLogRepository.findByActorEmailOrderByTimestampDesc(adminUser.getEmail());
        }
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }

    public List<DataQualityIssue> getDataQualityIssues() {
        return qualityIssueRepository.findAll();
    }

    @Transactional
    public DataQualityIssue resolveDataQualityIssue(Long issueId, User admin) {
        DataQualityIssue issue = qualityIssueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found"));
        issue.setResolved(true);
        DataQualityIssue saved = qualityIssueRepository.save(issue);

        auditLogRepository.save(new AuditLog(
                admin.getEmail(), admin.getRole().name(), "RESOLVE_DATA_QUALITY_ISSUE",
                "DataQualityIssue", saved.getId(), "Resolved issue " + issue.getIssueType(), "127.0.0.1"
        ));
        return saved;
    }

    public List<DataSourceConfig> getAllDataSources() {
        return dataSourceConfigRepository.findAll();
    }

    @Transactional
    public DataSourceConfig toggleDataSource(Long sourceId, boolean active, User admin) {
        DataSourceConfig config = dataSourceConfigRepository.findById(sourceId)
                .orElseThrow(() -> new IllegalArgumentException("Data source not found."));
        config.setActive(active);
        DataSourceConfig saved = dataSourceConfigRepository.save(config);

        auditLogRepository.save(new AuditLog(
                admin.getEmail(), admin.getRole().name(), "TOGGLE_DATA_SOURCE",
                "DataSourceConfig", saved.getId(), "Set active=" + active + " for " + config.getSourceCode(), "127.0.0.1"
        ));
        return saved;
    }
}

