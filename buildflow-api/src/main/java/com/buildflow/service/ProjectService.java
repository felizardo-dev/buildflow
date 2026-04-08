package com.buildflow.service;

import com.buildflow.dto.CreateProjectRequest;
import com.buildflow.dto.ProjectResponse;
import com.buildflow.entity.Project;
import com.buildflow.entity.ProjectMember;
import com.buildflow.entity.User;
import com.buildflow.repository.ProjectMemberRepository;
import com.buildflow.repository.ProjectRepository;
import com.buildflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponse createProject(String email, CreateProjectRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = Project.builder()
                .company(user.getCompany())
                .name(request.getName())
                .address(request.getAddress())
                .startDate(request.getStartDate())
                .deadline(request.getDeadline())
                .budget(request.getBudget())
                .description(request.getDescription())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .photoUrl(request.getPhotoUrl())
                .status(Project.ProjectStatus.PLANNING)
                .progress(0)
                .createdBy(user)
                .build();

        project = projectRepository.save(project);

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .role("MANAGER")
                .build();

        projectMemberRepository.save(member);

        int memberCount = projectMemberRepository.findByProjectId(project.getId()).size();

        return toResponse(project, memberCount);
    }

    private ProjectResponse toResponse(Project project, int memberCount) {
        return ProjectResponse.builder()
                .id(project.getId().toString())
                .companyId(project.getCompany().getId().toString())
                .name(project.getName())
                .address(project.getAddress())
                .latitude(project.getLatitude())
                .longitude(project.getLongitude())
                .status(project.getStatus().name())
                .budget(project.getBudget())
                .startDate(project.getStartDate())
                .deadline(project.getDeadline())
                .progress(project.getProgress())
                .description(project.getDescription())
                .photoUrl(project.getPhotoUrl())
                .createdBy(project.getCreatedBy() != null ? project.getCreatedBy().getName() : null)
                .memberCount(memberCount)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
