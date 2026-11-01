package com.airwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "help_articles")
public class HelpArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String targetRole; // CITIZEN, RESEARCHER, ADMIN, GENERAL

    @Column(nullable = false, length = 50)
    private String category; // GETTING_STARTED, AQI_EXPLANATION, TOOLS, DATA_SOURCES, ACCOUNT

    @Column(nullable = false, length = 200)
    private String titleEn;

    @Column(nullable = false, length = 200)
    private String titleHi;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentEn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentHi;

    private int sortOrder = 0;
    private boolean faq = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public HelpArticle() {}

    public HelpArticle(String targetRole, String category, String titleEn, String titleHi, String contentEn, String contentHi, int sortOrder, boolean faq) {
        this.targetRole = targetRole;
        this.category = category;
        this.titleEn = titleEn;
        this.titleHi = titleHi;
        this.contentEn = contentEn;
        this.contentHi = contentHi;
        this.sortOrder = sortOrder;
        this.faq = faq;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }

    public String getTitleHi() { return titleHi; }
    public void setTitleHi(String titleHi) { this.titleHi = titleHi; }

    public String getContentEn() { return contentEn; }
    public void setContentEn(String contentEn) { this.contentEn = contentEn; }

    public String getContentHi() { return contentHi; }
    public void setContentHi(String contentHi) { this.contentHi = contentHi; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public boolean isFaq() { return faq; }
    public void setFaq(boolean faq) { this.faq = faq; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

