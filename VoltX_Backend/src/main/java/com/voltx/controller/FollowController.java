package com.voltx.controller;

import com.voltx.dto.UserProfileDTO;
import com.voltx.entity.User;
import com.voltx.service.FollowService;
import com.voltx.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for user following/followers operations
 */
@Slf4j
@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final UserService userService;

    /**
     * Follow a user
     */
    @PostMapping("/{userId}")
    public ResponseEntity<Map<String, String>> followUser(
            @PathVariable Long userId,
            Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);

        try {
            followService.followUser(currentUserId, userId);
            return ResponseEntity.ok(Map.of("message", "Successfully followed user"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unfollow a user
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, String>> unfollowUser(
            @PathVariable Long userId,
            Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);

        try {
            followService.unfollowUser(currentUserId, userId);
            return ResponseEntity.ok(Map.of("message", "Successfully unfollowed user"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if following a user
     */
    @GetMapping("/check/{userId}")
    public ResponseEntity<Map<String, Boolean>> checkFollowing(
            @PathVariable Long userId,
            Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);
        boolean isFollowing = followService.isFollowing(currentUserId, userId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    /**
     * Get followers of a user
     */
    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<UserProfileDTO>> getFollowers(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserProfileDTO> followers = followService.getFollowers(userId, pageable);
        return ResponseEntity.ok(followers);
    }

    /**
     * Get users that a user is following
     */
    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<UserProfileDTO>> getFollowing(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserProfileDTO> following = followService.getFollowing(userId, pageable);
        return ResponseEntity.ok(following);
    }

    /**
     * Get all followers (non-paginated)
     */
    @GetMapping("/{userId}/followers/all")
    public ResponseEntity<List<UserProfileDTO>> getAllFollowers(@PathVariable Long userId) {
        List<UserProfileDTO> followers = followService.getAllFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    /**
     * Get all following (non-paginated)
     */
    @GetMapping("/{userId}/following/all")
    public ResponseEntity<List<UserProfileDTO>> getAllFollowing(@PathVariable Long userId) {
        List<UserProfileDTO> following = followService.getAllFollowing(userId);
        return ResponseEntity.ok(following);
    }

    /**
     * Get follower count
     */
    @GetMapping("/{userId}/followers/count")
    public ResponseEntity<Map<String, Long>> getFollowerCount(@PathVariable Long userId) {
        long count = followService.getFollowerCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Get following count
     */
    @GetMapping("/{userId}/following/count")
    public ResponseEntity<Map<String, Long>> getFollowingCount(@PathVariable Long userId) {
        long count = followService.getFollowingCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Get follow statistics
     */
    @GetMapping("/{userId}/stats")
    public ResponseEntity<?> getFollowStats(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowStats(userId));
    }

    /**
     * Get suggested users to follow
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<UserProfileDTO>> getSuggestedUsers(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit) {
        Long currentUserId = getCurrentUserId(authentication);
        List<UserProfileDTO> suggestions = followService.getSuggestedUsers(currentUserId, limit);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Get mutual followers between two users
     */
    @GetMapping("/mutual/{userId1}/{userId2}")
    public ResponseEntity<List<UserProfileDTO>> getMutualFollowers(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        List<UserProfileDTO> mutualFollowers = followService.getMutualFollowers(userId1, userId2);
        return ResponseEntity.ok(mutualFollowers);
    }

    /**
     * Remove a follower
     */
    @DeleteMapping("/followers/{followerId}")
    public ResponseEntity<Map<String, String>> removeFollower(
            @PathVariable Long followerId,
            Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);

        try {
            followService.removeFollower(currentUserId, followerId);
            return ResponseEntity.ok(Map.of("message", "Successfully removed follower"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Follow multiple users at once
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, String>> followMultipleUsers(
            @RequestBody Map<String, List<Long>> request,
            Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);
        List<Long> userIds = request.get("userIds");

        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "User IDs are required"));
        }

        followService.followMultipleUsers(currentUserId, userIds);
        return ResponseEntity.ok(Map.of(
                "message", "Successfully followed users",
                "count", String.valueOf(userIds.size())
        ));
    }

    /**
     * Get recent followers
     */
    @GetMapping("/recent")
    public ResponseEntity<List<UserProfileDTO>> getRecentFollowers(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit) {
        Long currentUserId = getCurrentUserId(authentication);
        List<UserProfileDTO> recentFollowers = followService.getRecentFollowers(currentUserId, limit);
        return ResponseEntity.ok(recentFollowers);
    }

    private Long getCurrentUserId(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user.getId();
    }
}
