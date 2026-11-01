package com.airwise.controller;

import com.airwise.entity.HelpArticle;
import com.airwise.service.HelpArticleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/help")
public class HelpController {

    private final HelpArticleService helpArticleService;

    public HelpController(HelpArticleService helpArticleService) {
        this.helpArticleService = helpArticleService;
    }

    @GetMapping("/articles")
    public ResponseEntity<List<HelpArticle>> getArticles(
            @RequestParam(required = false) String role,
            Authentication auth) {
        String effectiveRole = role;
        if (auth != null && auth.isAuthenticated()) {
            effectiveRole = auth.getAuthorities().stream().findFirst().map(Object::toString).orElse("ROLE_CITIZEN");
        }
        return ResponseEntity.ok(helpArticleService.getArticlesForRole(effectiveRole));
    }

    @PostMapping("/articles")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CENTRAL_ADMIN')")
    public ResponseEntity<HelpArticle> createArticle(@RequestBody HelpArticle article) {
        return ResponseEntity.ok(helpArticleService.saveOrUpdateArticle(article));
    }

    @PutMapping("/articles/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CENTRAL_ADMIN')")
    public ResponseEntity<HelpArticle> updateArticle(@PathVariable Long id, @RequestBody HelpArticle article) {
        article.setId(id);
        return ResponseEntity.ok(helpArticleService.saveOrUpdateArticle(article));
    }

    @DeleteMapping("/articles/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CENTRAL_ADMIN')")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        helpArticleService.deleteArticle(id);
        return ResponseEntity.ok(Map.of("message", "Article deleted successfully."));
    }
}

