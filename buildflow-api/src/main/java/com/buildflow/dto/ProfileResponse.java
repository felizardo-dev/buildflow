package com.buildflow.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;
    private String role;
    private String companyId;
    private String companyName;
}
