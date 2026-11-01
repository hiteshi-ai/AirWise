package com.airwise.repository;

import com.airwise.entity.HelpArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpArticleRepository extends JpaRepository<HelpArticle, Long> {
    List<HelpArticle> findByTargetRoleInOrderBySortOrderAsc(List<String> targetRoles);
    List<HelpArticle> findByTargetRoleOrderBySortOrderAsc(String targetRole);
    List<HelpArticle> findByFaqTrueOrderBySortOrderAsc();
}

