package com.buildflow.repository;

import com.buildflow.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {

    List<ProjectMember> findByProjectId(UUID projectId);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);
}
