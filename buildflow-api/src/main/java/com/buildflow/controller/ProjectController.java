package com.buildflow.controller;

import com.buildflow.dto.CreateProjectRequest;
import com.buildflow.dto.ProjectDetailResponse;
import com.buildflow.dto.ProjectResponse;
import com.buildflow.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy) {
        List<ProjectResponse> response = projectService.getProjects(userDetails.getUsername(), status, sortBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailResponse> getProjectById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        ProjectDetailResponse response = projectService.getProjectById(userDetails.getUsername(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse response = projectService.createProject(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
