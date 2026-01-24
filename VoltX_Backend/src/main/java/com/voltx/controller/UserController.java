package com.voltx.controller;

import com.voltx.dto.ApiResponse;
import com.voltx.dto.UserDTO;
import com.voltx.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasRole("ADMIN) or authentication.principal.id == #id")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @PathVariable Long id,
            @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateProfile(id, userDTO);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
    }

    @PostMapping("/{id}/points")
    @PreAuthorize("hasRole("ADMIN) or hasRole("CAPTAIN)")
    public ResponseEntity<ApiResponse<UserDTO>> addAdrenalinePoints(
            @PathVariable Long id,
            @RequestParam int points) {
        UserDTO updatedUser = userService.addAdrenalinePoints(id, points);
        return ResponseEntity.ok(ApiResponse.success("Points added successfully", updatedUser));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole("ADMIN)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStatistics() {
        Map<String, Object> stats = userService.getUserStatistics();
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    }
}
