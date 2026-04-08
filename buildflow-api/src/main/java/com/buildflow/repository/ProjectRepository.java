package com.buildflow.repository;

import com.buildflow.entity.Project;
import com.buildflow.entity.Project.ProjectStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findByCompanyId(UUID companyId);

    List<Project> findByCompanyId(UUID companyId, Sort sort);

    List<Project> findByCompanyIdAndStatus(UUID companyId, ProjectStatus status);

    List<Project> findByCompanyIdAndStatus(UUID companyId, ProjectStatus status, Sort sort);
}
