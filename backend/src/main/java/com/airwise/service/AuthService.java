package com.airwise.service;

import com.airwise.config.JwtTokenProvider;
import com.airwise.entity.*;
import com.airwise.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ResearcherApplicationRepository researcherApplicationRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogRepository auditLogRepository;

    public AuthService(UserRepository userRepository,
                       ResearcherApplicationRepository researcherApplicationRepository,
                       UserPreferenceRepository userPreferenceRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.researcherApplicationRepository = researcherApplicationRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditLogRepository = auditLogRepository;
    }

    public static class AuthResponse {
        private String token;
        private Long userId;
        private String fullName;
        private String email;
        private String role;
        private String stateScope;
        private String status;
        private String preferredTheme;
        private String preferredLanguage;

        public AuthResponse(String token, Long userId, String fullName, String email, String role, String stateScope, String status, String preferredTheme, String preferredLanguage) {
            this.token = token;
            this.userId = userId;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
            this.stateScope = stateScope;
            this.status = status;
            this.preferredTheme = preferredTheme;
            this.preferredLanguage = preferredLanguage;
        }

        public String getToken() { return token; }
        public Long getUserId() { return userId; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public String getStateScope() { return stateScope; }
        public String getStatus() { return status; }
        public String getPreferredTheme() { return preferredTheme; }
        public String getPreferredLanguage() { return preferredLanguage; }
    }

    public boolean isSuperAdminConfigured() {
        return userRepository.existsByRole(Role.ROLE_SUPER_ADMIN);
    }

    @Transactional
    public AuthResponse setupInitialSuperAdmin(String fullName, String email, String rawPassword) {
        if (isSuperAdminConfigured()) {
            throw new IllegalStateException("Initial Super Admin setup is already completed and permanently disabled.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with this email already exists.");
        }

        User superAdmin = new User();
        superAdmin.setFullName(fullName);
        superAdmin.setEmail(email.toLowerCase().trim());
        superAdmin.setPassword(passwordEncoder.encode(rawPassword));
        superAdmin.setRole(Role.ROLE_SUPER_ADMIN);
        superAdmin.setStatus("ACTIVE");
        superAdmin.setEmailVerified(true);
        User saved = userRepository.save(superAdmin);

        UserPreference pref = userPreferenceRepository.save(new UserPreference(saved.getId(), "lavender", "en"));
        auditLogRepository.save(new AuditLog(saved.getEmail(), "ROLE_SUPER_ADMIN", "INITIAL_SETUP", "SYSTEM", saved.getId(), "Initial Super Admin configured securely.", "127.0.0.1"));

        String token = tokenProvider.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());
        return new AuthResponse(token, saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole().name(), null, saved.getStatus(), pref.getPreferredTheme(), pref.getPreferredLanguage());
    }

    @Transactional
    public AuthResponse login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        if ("PENDING".equals(user.getStatus())) {
            throw new IllegalStateException("Your researcher application is pending administrator review and approval.");
        }

        if ("REJECTED".equals(user.getStatus()) || "SUSPENDED".equals(user.getStatus())) {
            throw new IllegalStateException("Your account is currently inactive or has been rejected. Contact administrator.");
        }

        UserPreference pref = userPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> userPreferenceRepository.save(new UserPreference(user.getId(), "lavender", "en")));

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), user.getStateScope(), user.getStatus(), pref.getPreferredTheme(), pref.getPreferredLanguage());
    }

    @Transactional
    public AuthResponse registerCitizen(String fullName, String email, String rawPassword) {
        String cleanEmail = email.toLowerCase().trim();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User citizen = new User(fullName, cleanEmail, passwordEncoder.encode(rawPassword), Role.ROLE_CITIZEN);
        citizen.setStatus("ACTIVE");
        citizen.setEmailVerified(true);
        User saved = userRepository.save(citizen);

        UserPreference pref = userPreferenceRepository.save(new UserPreference(saved.getId(), "lavender", "en"));
        String token = tokenProvider.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());

        auditLogRepository.save(new AuditLog(saved.getEmail(), "ROLE_CITIZEN", "REGISTER", "User", saved.getId(), "Citizen self-registered.", "127.0.0.1"));
        return new AuthResponse(token, saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole().name(), null, saved.getStatus(), pref.getPreferredTheme(), pref.getPreferredLanguage());
    }

    @Transactional
    public ResearcherApplication registerResearcher(String fullName, String email, String rawPassword,
                                                   String institution, String researchField, String justification) {
        String cleanEmail = email.toLowerCase().trim();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User researcher = new User(fullName, cleanEmail, passwordEncoder.encode(rawPassword), Role.ROLE_RESEARCHER);
        researcher.setInstitution(institution);
        researcher.setResearchField(researchField);
        researcher.setResearchJustification(justification);
        researcher.setStatus("PENDING");
        User saved = userRepository.save(researcher);

        userPreferenceRepository.save(new UserPreference(saved.getId(), "lavender", "en"));

        ResearcherApplication application = new ResearcherApplication(
                saved.getId(), fullName, cleanEmail, institution, researchField, justification
        );
        ResearcherApplication savedApp = researcherApplicationRepository.save(application);

        auditLogRepository.save(new AuditLog(saved.getEmail(), "ROLE_RESEARCHER", "APPLY", "ResearcherApplication", savedApp.getId(), "Researcher access application submitted.", "127.0.0.1"));
        return savedApp;
    }

    @Transactional
    public void updateUserPreference(Long userId, String theme, String language) {
        UserPreference pref = userPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> new UserPreference(userId, theme, language));
        if (theme != null) pref.setPreferredTheme(theme);
        if (language != null) pref.setPreferredLanguage(language);
        userPreferenceRepository.save(pref);
    }
}

