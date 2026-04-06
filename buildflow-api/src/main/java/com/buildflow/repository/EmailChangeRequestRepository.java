package com.buildflow.repository;

import com.buildflow.entity.EmailChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailChangeRequestRepository extends JpaRepository<EmailChangeRequest, UUID> {
    Optional<EmailChangeRequest> findByToken(String token);
    void deleteByUserId(UUID userId);
}
