package com.buildflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @NotNull(message = "Budget is required")
    @Positive(message = "Budget must be positive")
    private BigDecimal budget;

    private String description;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String photoUrl;
}
