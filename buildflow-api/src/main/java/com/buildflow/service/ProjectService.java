package com.buildflow.service;

import com.buildflow.dto.CreateProjectRequest;
import com.buildflow.dto.ProjectDetailResponse;
import com.buildflow.dto.ProjectResponse;
import com.buildflow.entity.Project;
import com.buildflow.entity.ProjectMember;
import com.buildflow.entity.User;
import com.buildflow.repository.ProjectMemberRepository;
import com.buildflow.repository.ProjectRepository;
import com.buildflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public List<ProjectResponse> getProjects(String email, String status, String sortBy) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        var companyId = user.getCompany().getId();
        Sort sort = buildSort(sortBy);

        List<Project> projects;
        if (status != null && !status.isBlank()) {
            Project.ProjectStatus projectStatus = Project.ProjectStatus.valueOf(status.toUpperCase());
            projects = projectRepository.findByCompanyIdAndStatus(companyId, projectStatus, sort);
        } else {
            projects = projectRepository.findByCompanyId(companyId, sort);
        }

        return projects.stream()
                .map(p -> toResponse(p, projectMemberRepository.findByProjectId(p.getId()).size()))
                .collect(Collectors.toList());
    }

    public ProjectDetailResponse getProjectById(String email, UUID projectId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId());
        boolean isSameCompany = project.getCompany().getId().equals(user.getCompany().getId());

        if (!isMember && !isSameCompany) {
            throw new RuntimeException("Access denied");
        }

        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);

        List<ProjectDetailResponse.MemberDto> memberDtos = members.stream()
                .map(m -> ProjectDetailResponse.MemberDto.builder()
                        .id(m.getUser().getId().toString())
                        .name(m.getUser().getName())
                        .email(m.getUser().getEmail())
                        .role(m.getRole())
                        .avatarUrl(m.getUser().getAvatarUrl())
                        .build())
                .collect(Collectors.toList());

        return ProjectDetailResponse.builder()
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
                .memberCount(members.size())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .members(memberDtos)
                .phases(Collections.emptyList())
                .recentTasks(Collections.emptyList())
                .build();
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sortBy.toLowerCase()) {
            case "deadline" -> Sort.by(Sort.Direction.ASC, "deadline");
            case "progress" -> Sort.by(Sort.Direction.DESC, "progress");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
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
