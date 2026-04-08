package com.buildflow.repository;

import com.buildflow.entity.Project;
import com.buildflow.entity.Project.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findByCompanyId(UUID companyId);

    List<Project> findByCompanyIdAndStatus(UUID companyId, ProjectStatus status);
}
