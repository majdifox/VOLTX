package com.voltx.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltx.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * INTEGRATION TEST for POST /api/auth/register
 *
 * What is an integration test?
 *   - Loads the FULL Spring application context (real beans, real DB, real security).
 *   - Sends a simulated HTTP request through the entire stack:
 *       HTTP Request → Security Filter → Controller → Service → Repository → DB
 *   - No mocks — everything is REAL.
 *   - Slower than unit tests but proves the whole system works together.
 *
 * Annotations:
 *   @SpringBootTest       → starts the full Spring context
 *   @AutoConfigureMockMvc → injects MockMvc so we can simulate HTTP calls without starting a real server
 *   @ActiveProfiles("test")→ uses application-test.properties (e.g. H2 in-memory DB)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    /**
     * MockMvc lets us simulate HTTP requests (GET, POST, PUT, DELETE)
     * and assert on the response — without starting a real HTTP server.
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * ObjectMapper turns Java objects into JSON strings (for the request body).
     */
    @Autowired
    private ObjectMapper objectMapper;

    // =========================================================
    // TEST 1: Valid registration → 200 OK + tokens in response
    // =========================================================

    @Test
    void register_shouldReturn200AndTokens_whenRequestIsValid() throws Exception {
        // ARRANGE — build a valid registration payload
        RegisterRequest request = new RegisterRequest(
                "Alice",             // firstName
                "Smith",             // lastName
                "Female",            // gender
                "1998-05-20",        // birthday
                "alice_integration", // unique username (avoid conflicts)
                "alice@integration.com", // unique email
                "password123",       // password
                "France",            // country
                "🇫🇷",               // countryFlag
                "Paris",             // city
                "0700000000"         // phoneNumber
        );

        // ACT + ASSERT — perform POST /api/auth/register and check the response
        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)) // serialize to JSON
        )
        .andExpect(status().isOk())                          // HTTP 200
        .andExpect(jsonPath("$.accessToken").isNotEmpty())   // response has accessToken
        .andExpect(jsonPath("$.refreshToken").isNotEmpty())  // response has refreshToken
        .andExpect(jsonPath("$.user.username").value("alice_integration")); // username matches
    }

    // =========================================================
    // TEST 2: Missing required fields → 400 Bad Request
    // =========================================================

    @Test
    void register_shouldReturn400_whenRequiredFieldsAreMissing() throws Exception {
        // ARRANGE — send an empty JSON body (validation will fail)
        String emptyJson = "{}";

        // ACT + ASSERT
        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(emptyJson)
        )
        .andExpect(status().isBadRequest()); // @Valid triggers → 400
    }

    // =========================================================
    // TEST 3: Duplicate username → 400 Bad Request
    // =========================================================

    @Test
    void register_shouldReturn400_whenUsernameIsDuplicate() throws Exception {
        // ARRANGE — register once
        RegisterRequest first = new RegisterRequest(
                "Bob", "Brown", "Male", "1995-03-10",
                "bob_duplicate", "bob_first@test.com",
                "pass1234", "Spain", "🇪🇸", "Madrid", "0600000001"
        );

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first))
        ).andExpect(status().isOk()); // first registration succeeds

        // Try registering AGAIN with the same username but different email
        RegisterRequest duplicate = new RegisterRequest(
                "Bob", "Brown", "Male", "1995-03-10",
                "bob_duplicate", // same username!
                "bob_second@test.com",
                "pass5678", "Spain", "🇪🇸", "Madrid", "0600000002"
        );

        // ACT + ASSERT — second registration should fail
        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate))
        )
        .andExpect(status().isBadRequest()); // "Username already taken"
    }
}
