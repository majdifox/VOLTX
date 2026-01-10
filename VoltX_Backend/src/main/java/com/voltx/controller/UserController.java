package com.voltx.controller;

import com.voltx.dto.UpdateProfileRequest;
import com.voltx.dto.UserProfileResponse;
import com.voltx.entity.User;
import com.voltx.security.CurrentUser;
import com.voltx.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        UserProfileResponse response = userService.toProfileResponse(user, user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByUsername(userDetails.getUsername());
        User user = userService.findById(id);
        UserProfileResponse response = userService.toProfileResponse(user, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserProfileResponse> getUserByUsername(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByUsername(userDetails.getUsername());
        User user = userService.findByUsername(username);
        UserProfileResponse response = userService.toProfileResponse(user, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        User updatedUser = userService.updateProfile(user, request);
        UserProfileResponse response = userService.toProfileResponse(updatedUser, updatedUser.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/profile-picture")
    public ResponseEntity<UserProfileResponse> updateProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User user = userService.findByUsername(userDetails.getUsername());
        User updatedUser = userService.updateProfilePicture(user, file);
        UserProfileResponse response = userService.toProfileResponse(updatedUser, updatedUser.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/banner-picture")
    public ResponseEntity<UserProfileResponse> updateBannerPicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User user = userService.findByUsername(userDetails.getUsername());
        User updatedUser = userService.updateBannerPicture(user, file);
        UserProfileResponse response = userService.toProfileResponse(updatedUser, updatedUser.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<Void> followUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        userService.followUser(user, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<Void> unfollowUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        userService.unfollowUser(user, id);
        return ResponseEntity.ok().build();
    }
}
