package com.voltx.service;

import com.voltx.dto.AuthResponse;
import com.voltx.dto.RegisterRequest;
import com.voltx.entity.User;
import com.voltx.exception.BadRequestException;
import com.voltx.repository.UserRepository;
import com.voltx.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * UNIT TEST for AuthService.register()
 *
 * What is a unit test?
 *   - Tests ONE class in isolation.
 *   - All external dependencies (database, JWT, encoder) are MOCKED (faked).
 *   - No Spring context is loaded → runs very fast.
 *
 * Annotations:
 *   @ExtendWith(MockitoExtension.class) → enables Mockito in JUnit 5
 *   @Mock                               → creates a fake object
 *   @InjectMocks                        → creates the real AuthService and injects the mocks into it
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    // ---------- Mocked dependencies ----------

    @Mock
    private UserRepository userRepository;   // fake database

    @Mock
    private PasswordEncoder passwordEncoder; // fake bcrypt

    @Mock
    private JwtUtil jwtUtil;                 // fake JWT generator

    @Mock
    private UserService userService;         // fake UserService

    // ---------- Class under test ----------

    @InjectMocks
    private AuthService authService;         // REAL AuthService, receives the mocks above

    // ---------- Shared test data ----------

    private RegisterRequest validRequest;

    @BeforeEach
    void setUp() {
        // A valid registration request used across tests
        validRequest = new RegisterRequest(
                "John",          // firstName
                "Doe",           // lastName
                "Male",          // gender
                "2000-01-15",    // birthday (yyyy-MM-dd)
                "johndoe",       // username
                "john@test.com", // email
                "secret123",     // password
                "Morocco",       // country
                "🇲🇦",           // countryFlag
                "Casablanca",    // city
                "0600000000"     // phoneNumber
        );
    }

    // =========================================================
    // TEST 1: Happy path — registration succeeds
    // =========================================================

    @Test
    void register_shouldSaveUserAndReturnTokens_whenRequestIsValid() {
        // ARRANGE — tell the mocks what to return

        // No existing user with this username or email
        when(userRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userRepository.existsByEmail("john@test.com")).thenReturn(false);

        // Fake password encoding
        when(passwordEncoder.encode("secret123")).thenReturn("hashed_password");

        // Fake save — return a user with an ID
        User savedUser = User.builder()
                .id(1L)
                .username("johndoe")
                .email("john@test.com")
                .passwordHash("hashed_password")
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Fake JWT generation
        when(jwtUtil.generateAccessToken(anyLong(), anyString(), anyString()))
                .thenReturn("fake-access-token");
        when(jwtUtil.generateRefreshToken(anyLong(), anyString(), anyString()))
                .thenReturn("fake-refresh-token");

        // Fake profile response
        when(userService.toProfileResponse(any(User.class), isNull()))
                .thenReturn(null); // we don't care about the profile shape here

        // ACT — call the real method
        AuthResponse response = authService.register(validRequest);

        // ASSERT — verify the output
        assertNotNull(response);
        assertEquals("fake-access-token", response.getAccessToken());
        assertEquals("fake-refresh-token", response.getRefreshToken());

        // Verify the user was actually saved to the (fake) repository
        verify(userRepository, times(1)).save(any(User.class));
    }

    // =========================================================
    // TEST 2: Duplicate username → throws BadRequestException
    // =========================================================

    @Test
    void register_shouldThrowBadRequestException_whenUsernameAlreadyExists() {
        // ARRANGE — username is already taken
        when(userRepository.existsByUsername("johndoe")).thenReturn(true);

        // ACT + ASSERT — expect an exception
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> authService.register(validRequest)
        );

        assertEquals("Username already taken", exception.getMessage());

        // The user must NOT be saved when username is duplicate
        verify(userRepository, never()).save(any(User.class));
    }

    // =========================================================
    // TEST 3: Duplicate email → throws BadRequestException
    // =========================================================

    @Test
    void register_shouldThrowBadRequestException_whenEmailAlreadyExists() {
        // ARRANGE — username is free but email is taken
        when(userRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        // ACT + ASSERT
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> authService.register(validRequest)
        );

        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
