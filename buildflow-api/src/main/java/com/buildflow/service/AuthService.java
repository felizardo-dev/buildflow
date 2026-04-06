package com.buildflow.service;

import com.buildflow.dto.AuthResponse;
import com.buildflow.dto.LoginRequest;
import com.buildflow.dto.RegisterRequest;
import com.buildflow.entity.Company;
import com.buildflow.entity.User;
import com.buildflow.repository.CompanyRepository;
import com.buildflow.repository.UserRepository;
import com.buildflow.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Company company = Company.builder()
                .name(request.getCompanyName())
                .country(request.getCountry())
                .plan("FREE")
                .build();
        company = companyRepository.save(company);

        User user = User.builder()
                .company(company)
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.ADMIN)
                .active(true)
                .build();
        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return buildAuthResponse(token, user, company);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (isAccountLocked(user)) {
            long minutesRemaining = java.time.Duration
                    .between(LocalDateTime.now(), user.getLockedUntil())
                    .toMinutes() + 1;
            throw new RuntimeException(
                    "Account locked. Try again in " + minutesRemaining + " minute(s).");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            handleFailedAttempt(user);
            throw new RuntimeException("Invalid email or password");
        }

        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return buildAuthResponse(token, user, user.getCompany());
    }

    private boolean isAccountLocked(User user) {
        return user.getLockedUntil() != null
                && user.getLockedUntil().isAfter(LocalDateTime.now());
    }

    private void handleFailedAttempt(User user) {
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
        }

        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(String token, User user, Company company) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId().toString())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .companyId(company.getId().toString())
                        .companyName(company.getName())
                        .build())
                .build();
    }
}
