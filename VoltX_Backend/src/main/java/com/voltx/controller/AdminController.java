package com.voltx.controller;

import com.voltx.dto.AccountActionRequest;
import com.voltx.dto.AdminDashboardStats;
import com.voltx.entity.User;
import com.voltx.service.AdminService;
import com.voltx.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardStats> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userService.findByUsername(userDetails.getUsername());
        adminService.validateAdminAccess(admin);
        AdminDashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<Void> suspendUser(
            @PathVariable Long userId,
            @Valid @RequestBody AccountActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userService.findByUsername(userDetails.getUsername());
        adminService.suspendUser(userId, admin, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<Void> banUser(
            @PathVariable Long userId,
            @Valid @RequestBody AccountActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userService.findByUsername(userDetails.getUsername());
        adminService.banUser(userId, admin, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/unsuspend")
    public ResponseEntity<Void> unsuspendUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userService.findByUsername(userDetails.getUsername());
        adminService.unsuspendUser(userId, admin);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/events/{eventId}/approve")
    public ResponseEntity<Void> approveEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userService.findByUsername(userDetails.getUsername());
        adminService.approveEvent(eventId, admin);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/events/{eventId}/reject")
    public ResponseEntity<Void> rejectEvent(
            @PathVariable Long eventId,
            @RequestParam String reason,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userService.findByUsername(userDetails.getUsername());
        adminService.rejectEvent(eventId, admin, reason);
        return ResponseEntity.ok().build();
    }
}
