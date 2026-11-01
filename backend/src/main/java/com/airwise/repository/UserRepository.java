package com.airwise.repository;

import com.airwise.entity.User;
import com.airwise.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);
    List<User> findByRole(Role role);
    List<User> findByStatus(String status);
    List<User> findByStateScope(String stateScope);
}

