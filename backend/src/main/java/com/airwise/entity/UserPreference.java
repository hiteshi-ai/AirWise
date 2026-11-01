package com.airwise.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(length = 30)
    private String preferredTheme = "lavender"; // lavender, skyblue, mint, peach, neutral

    @Column(length = 10)
    private String preferredLanguage = "en"; // en, hi

    private boolean emailAlertsEnabled = true;

    public UserPreference() {}

    public UserPreference(Long userId, String preferredTheme, String preferredLanguage) {
        this.userId = userId;
        this.preferredTheme = preferredTheme;
        this.preferredLanguage = preferredLanguage;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getPreferredTheme() { return preferredTheme; }
    public void setPreferredTheme(String preferredTheme) { this.preferredTheme = preferredTheme; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public boolean isEmailAlertsEnabled() { return emailAlertsEnabled; }
    public void setEmailAlertsEnabled(boolean emailAlertsEnabled) { this.emailAlertsEnabled = emailAlertsEnabled; }
}

