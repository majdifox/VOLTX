package com.voltx.controller;

import com.voltx.dto.ActivityFeedItemDTO;
import com.voltx.entity.User;
import com.voltx.service.ActivityFeedService;
import com.voltx.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for activity feed operations
 */
@Slf4j
@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class ActivityFeedController {

    private final ActivityFeedService activityFeedService;
    private final UserService userService;

    /**
     * Get personalized feed (from followed users)
     */
    @GetMapping("/personalized")
    public ResponseEntity<Page<ActivityFeedItemDTO>> getPersonalizedFeed(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getCurrentUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityFeedItemDTO> feed = activityFeedService.getPersonalizedFeed(userId, pageable);
        return ResponseEntity.ok(feed);
    }

    /**
     * Get global feed (all public activities)
     */
    @GetMapping("/global")
    public ResponseEntity<Page<ActivityFeedItemDTO>> getGlobalFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityFeedItemDTO> feed = activityFeedService.getGlobalFeed(pageable);
        return ResponseEntity.ok(feed);
    }

    /**
     * Get trending feed (popular activities)
     */
    @GetMapping("/trending")
    public ResponseEntity<Page<ActivityFeedItemDTO>> getTrendingFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityFeedItemDTO> feed = activityFeedService.getTrendingFeed(pageable);
        return ResponseEntity.ok(feed);
    }

    /**
     * Get feed filtered by activity type
     */
    @GetMapping("/type/{activityType}")
    public ResponseEntity<Page<ActivityFeedItemDTO>> getFeedByType(
            @PathVariable String activityType,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getCurrentUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityFeedItemDTO> feed = activityFeedService
                .getFeedByActivityType(userId, activityType, pageable);
        return ResponseEntity.ok(feed);
    }

    /**
     * Get activities from specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ActivityFeedItemDTO>> getUserActivities(
            @PathVariable Long userId,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long viewerId = getCurrentUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityFeedItemDTO> feed = activityFeedService
                .getUserActivities(userId, viewerId, pageable);
        return ResponseEntity.ok(feed);
    }

    /**
     * Get nearby activities
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<ActivityFeedItemDTO>> getNearbyActivities(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "50.0") Double radiusKm,
            @RequestParam(defaultValue = "20") int limit) {
        List<ActivityFeedItemDTO> activities = activityFeedService
                .getNearbyActivities(latitude, longitude, radiusKm, limit);
        return ResponseEntity.ok(activities);
    }

    /**
     * Get activities by tags
     */
    @GetMapping("/tags")
    public ResponseEntity<Page<ActivityFeedItemDTO>> getActivitiesByTags(
            @RequestParam List<String> tags,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityFeedItemDTO> feed = activityFeedService
                .getActivitiesByTags(tags, pageable);
        return ResponseEntity.ok(feed);
    }

    /**
     * Get feed statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getFeedStats(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(activityFeedService.getFeedStats(userId));
    }

    /**
     * Refresh feed cache
     */
    @PostMapping("/refresh")
    public ResponseEntity<String> refreshFeed(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        activityFeedService.refreshFeedCache(userId);
        return ResponseEntity.ok("Feed cache refreshed");
    }

    private Long getCurrentUserId(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user.getId();
    }
}
