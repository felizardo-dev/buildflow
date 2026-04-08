package com.buildflow.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProjectDetailResponse {

    private String id;
    private String companyId;
    private String name;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String status;
    private BigDecimal budget;
    private LocalDate startDate;
    private LocalDate deadline;
    private Integer progress;
    private String description;
    private String photoUrl;
    private String createdBy;
    private int memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<MemberDto> members;
    private List<PhaseDto> phases;
    private List<TaskDto> recentTasks;

    @Data
    @Builder
    public static class MemberDto {
        private String id;
        private String name;
        private String email;
        private String role;
        private String avatarUrl;
    }

    @Data
    @Builder
    public static class PhaseDto {
        private String id;
        private String name;
        private String status;
        private Integer progress;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    @Builder
    public static class TaskDto {
        private String id;
        private String name;
        private String status;
        private String assignee;
        private LocalDate deadline;
    }
}
