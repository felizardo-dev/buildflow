package com.buildflow.service;

import com.buildflow.dto.ProfileResponse;
import com.buildflow.dto.UpdateEmailRequest;
import com.buildflow.dto.UpdateProfileRequest;
import com.buildflow.entity.EmailChangeRequest;
import com.buildflow.entity.User;
import com.buildflow.repository.EmailChangeRequestRepository;
import com.buildflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmailChangeRequestRepository emailChangeRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public ProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        return toProfileResponse(user);
    }

    @Transactional
    public void requestEmailChange(String email, UpdateEmailRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Remove any pending request for this user before creating a new one
        emailChangeRequestRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        EmailChangeRequest changeRequest = EmailChangeRequest.builder()
                .user(user)
                .newEmail(request.getNewEmail())
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();
        emailChangeRequestRepository.save(changeRequest);

        String confirmLink = frontendUrl + "/confirm-email?token=" + token;
        emailService.sendEmailChangeConfirmationEmail(request.getNewEmail(), confirmLink);
    }

    @Transactional
    public void confirmEmailChange(String token) {
        EmailChangeRequest changeRequest = emailChangeRequestRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (changeRequest.getUsed()) {
            throw new RuntimeException("Token has already been used");
        }

        if (changeRequest.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        User user = changeRequest.getUser();
        user.setEmail(changeRequest.getNewEmail());
        userRepository.save(user);

        changeRequest.setUsed(true);
        emailChangeRequestRepository.save(changeRequest);
        // The user's existing JWT will no longer resolve — they must log in again
    }

    private ProfileResponse toProfileResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .companyId(user.getCompany().getId().toString())
                .companyName(user.getCompany().getName())
                .build();
    }
}
