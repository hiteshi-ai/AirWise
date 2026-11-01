package com.airwise.controller;

import com.airwise.entity.ResearcherApplication;
import com.airwise.entity.User;
import com.airwise.repository.UserRepository;
import com.airwise.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @GetMapping("/setup-status")
    public ResponseEntity<Map<String, Object>> getSetupStatus() {
        boolean superAdminExists = authService.isSuperAdminConfigured();
        return ResponseEntity.ok(Map.of(
                "superAdminConfigured", superAdminExists,
                "platformName", "AIRWISE - India Air Quality Intelligence Platform"
        ));
    }

    @PostMapping("/setup-super-admin")
    public ResponseEntity<?> setupInitialSuperAdmin(@RequestBody Map<String, String> body) {
        try {
            String fullName = body.get("fullName");
            String email = body.get("email");
            String password = body.get("password");

            if (fullName == null || email == null || password == null || password.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Full name, valid email, and password (min 6 characters) are required."));
            }

            AuthService.AuthResponse response = authService.setupInitialSuperAdmin(fullName, email, password);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
            }
            AuthService.AuthResponse response = authService.login(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/register-citizen")
    public ResponseEntity<?> registerCitizen(@RequestBody Map<String, String> body) {
        try {
            String fullName = body.get("fullName");
            String email = body.get("email");
            String password = body.get("password");

            if (fullName == null || email == null || password == null || password.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Full name, email, and password (min 6 chars) are required."));
            }

            AuthService.AuthResponse response = authService.registerCitizen(fullName, email, password);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/register-researcher")
    public ResponseEntity<?> registerResearcher(@RequestBody Map<String, String> body) {
        try {
            String fullName = body.get("fullName");
            String email = body.get("email");
            String password = body.get("password");
            String institution = body.get("institution");
            String researchField = body.get("researchField");
            String justification = body.get("justification");

            if (fullName == null || email == null || password == null || institution == null || justification == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "All fields including institution and research justification are required."));
            }

            ResearcherApplication application = authService.registerResearcher(
                    fullName, email, password, institution, researchField, justification
            );
            return ResponseEntity.ok(Map.of(
                    "status", "PENDING_APPROVAL",
                    "message", "Your researcher application has been submitted successfully. An administrator will review your credentials before granting access.",
                    "applicationId", application.getId()
            ));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updateUserPreferences(Authentication auth, @RequestBody Map<String, String> body) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user != null) {
            authService.updateUserPreference(user.getId(), body.get("theme"), body.get("language"));
            return ResponseEntity.ok(Map.of("message", "Preferences saved successfully."));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }
}

