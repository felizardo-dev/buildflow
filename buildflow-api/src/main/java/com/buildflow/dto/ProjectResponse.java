package com.buildflow.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ProjectResponse {

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
}
