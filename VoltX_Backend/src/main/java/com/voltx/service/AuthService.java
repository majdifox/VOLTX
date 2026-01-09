package com.voltx.service;

import com.voltx.dto.AuthResponse;
import com.voltx.dto.LoginRequest;
import com.voltx.dto.RegisterRequest;
import com.voltx.entity.User;
import com.voltx.enums.AccountStatus;
import com.voltx.enums.Role;
import com.voltx.exception.BadRequestException;
import com.voltx.exception.UnauthorizedException;
import com.voltx.repository.UserRepository;
import com.voltx.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        LocalDate birthday = null;
        if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
            birthday = LocalDate.parse(request.getBirthday(), DateTimeFormatter.ISO_DATE);
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .gender(request.getGender())
                .birthday(birthday)
                .country(request.getCountry())
                .countryFlag(request.getCountryFlag())
                .city(request.getCity())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.EXPLORER)
                .accountStatus(AccountStatus.ACTIVE)
                .verified(false)
                .adrenalinePoints(0)
                .level(1)
                .suspensionCount(0)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid token"));

        if (!jwtUtil.isTokenValid(refreshToken, username)) {
            throw new UnauthorizedException("Invalid token");
        }

        String newAccessToken = jwtUtil.generateAccessToken(username);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }
}
