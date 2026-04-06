package com.buildflow.controller;

import com.buildflow.dto.ProfileResponse;
import com.buildflow.dto.UpdateEmailRequest;
import com.buildflow.dto.UpdateProfileRequest;
import com.buildflow.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    @PostMapping("/profile/email")
    public ResponseEntity<Map<String, String>> requestEmailChange(
            Authentication authentication,
            @Valid @RequestBody UpdateEmailRequest request) {
        userService.requestEmailChange(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Check your email to confirm the change"));
    }

    @GetMapping("/confirm-email")
    public ResponseEntity<Map<String, String>> confirmEmailChange(@RequestParam String token) {
        userService.confirmEmailChange(token);
        return ResponseEntity.ok(Map.of("message", "Email updated successfully"));
    }
}
