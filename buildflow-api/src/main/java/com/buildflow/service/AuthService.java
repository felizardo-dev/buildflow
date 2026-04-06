package com.buildflow.service;

import com.buildflow.dto.AuthResponse;
import com.buildflow.dto.RegisterRequest;
import com.buildflow.entity.Company;
import com.buildflow.entity.User;
import com.buildflow.repository.CompanyRepository;
import com.buildflow.repository.UserRepository;
import com.buildflow.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // Verifica se o email já existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Cria a empresa
        Company company = Company.builder()
                .name(request.getCompanyName())
                .country(request.getCountry())
                .plan("FREE")
                .build();
        company = companyRepository.save(company);

        // Cria o utilizador Admin
        User user = User.builder()
                .company(company)
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.ADMIN)
                .active(true)
                .build();
        user = userRepository.save(user);

        // Gera o JWT
        String token = jwtService.generateToken(user.getEmail());

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