package com.voltx.service;

import com.voltx.dto.ActivityFeedItemDTO;
import com.voltx.entity.Activity;
import com.voltx.entity.Follow;
import com.voltx.entity.User;
import com.voltx.repository.ActivityRepository;
import com.voltx.repository.FollowRepository;
import com.voltx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for generating and managing social activity feeds
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityFeedService {

    private final ActivityRepository activityRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    /**
     * Get personalized feed for user (activities from followed users)
     */
    @Cacheable(value = "activityFeed", key = "#userId + '-' + #pageable.pageNumber")
    public Page<ActivityFeedItemDTO> getPersonalizedFeed(Long userId, Pageable pageable) {
        // Get list of users the current user follows
        List<Long> followingIds = followRepository.findByFollowerId(userId)
                .stream()
                .map(follow -> follow.getFollowing().getId())
                .collect(Collectors.toList());

        // Include user's own activities
        followingIds.add(userId);

        if (followingIds.isEmpty()) {
            return Page.empty(pageable);
        }

        // Get activities from followed users
        Page<Activity> activities = activityRepository
                .findByUserIdInOrderByCreatedAtDesc(followingIds, pageable);

        return activities.map(this::convertToFeedItemDTO);
    }

    /**
     * Get global feed (all public activities)
     */
    @Cacheable(value = "globalFeed", key = "#pageable.pageNumber")
    public Page<ActivityFeedItemDTO> getGlobalFeed(Pageable pageable) {
        Page<Activity> activities = activityRepository
                .findByIsPrivateFalseOrderByCreatedAtDesc(pageable);

        return activities.map(this::convertToFeedItemDTO);
    }

    /**
     * Get trending feed (popular activities based on engagement)
     */
    @Cacheable(value = "trendingFeed", key = "#pageable.pageNumber")
    public Page<ActivityFeedItemDTO> getTrendingFeed(Pageable pageable) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);

        // Get recent activities and sort by engagement score
        List<Activity> recentActivities = activityRepository
                .findByCreatedAtAfterAndIsPrivateFalse(cutoffDate);

        List<ActivityFeedItemDTO> feedItems = recentActivities.stream()
                .map(this::convertToFeedItemDTO)
                .sorted(Comparator.comparingDouble(ActivityFeedItemDTO::getEngagementScore).reversed())
                .collect(Collectors.toList());

        // Implement manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), feedItems.size());

        if (start >= feedItems.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, feedItems.size());
        }

        List<ActivityFeedItemDTO> pageContent = feedItems.subList(start, end);
        return new PageImpl<>(pageContent, pageable, feedItems.size());
    }

    /**
     * Get feed for specific activity type
     */
    public Page<ActivityFeedItemDTO> getFeedByActivityType(
            Long userId,
            String activityType,
            Pageable pageable) {

        List<Long> followingIds = followRepository.findByFollowerId(userId)
                .stream()
                .map(follow -> follow.getFollowing().getId())
                .collect(Collectors.toList());

        followingIds.add(userId);

        if (followingIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Page<Activity> activities = activityRepository
                .findByUserIdInAndActivityTypeOrderByCreatedAtDesc(
                        followingIds,
                        activityType,
                        pageable
                );

        return activities.map(this::convertToFeedItemDTO);
    }

    /**
     * Get activities from specific user
     */
    public Page<ActivityFeedItemDTO> getUserActivities(Long userId, Pageable pageable) {
        Page<Activity> activities = activityRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return activities.map(this::convertToFeedItemDTO);
    }

    /**
     * Get activities from specific user (only public if not own profile)
     */
    public Page<ActivityFeedItemDTO> getUserActivities(
            Long userId,
            Long viewerId,
            Pageable pageable) {

        Page<Activity> activities;

        if (userId.equals(viewerId)) {
            // Show all activities if viewing own profile
            activities = activityRepository
                    .findByUserIdOrderByCreatedAtDesc(userId, pageable);
        } else {
            // Show only public activities if viewing someone else's profile
            activities = activityRepository
                    .findByUserIdAndIsPrivateFalseOrderByCreatedAtDesc(userId, pageable);
        }

        return activities.map(this::convertToFeedItemDTO);
    }

    /**
     * Get nearby activities based on location
     */
    public List<ActivityFeedItemDTO> getNearbyActivities(
            Double latitude,
            Double longitude,
            Double radiusKm,
            int limit) {

        // For demo purposes, return recent activities
        // In production, implement proper geospatial queries
        List<Activity> activities = activityRepository
                .findTop50ByIsPrivateFalseOrderByCreatedAtDesc();

        return activities.stream()
                .limit(limit)
                .map(this::convertToFeedItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get activities with specific tags
     */
    public Page<ActivityFeedItemDTO> getActivitiesByTags(
            List<String> tags,
            Pageable pageable) {

        // Simplified tag search (in production, use proper tag entity relationships)
        Page<Activity> activities = activityRepository
                .findByIsPrivateFalseOrderByCreatedAtDesc(pageable);

        return activities.map(this::convertToFeedItemDTO);
    }

    /**
     * Get feed statistics
     */
    public FeedStats getFeedStats(Long userId) {
        List<Long> followingIds = followRepository.findByFollowerId(userId)
                .stream()
                .map(follow -> follow.getFollowing().getId())
                .collect(Collectors.toList());

        followingIds.add(userId);

        long totalActivities = activityRepository.countByUserIdIn(followingIds);
        long todayActivities = activityRepository
                .countByUserIdInAndCreatedAtAfter(
                        followingIds,
                        LocalDateTime.now().minusDays(1)
                );

        long weekActivities = activityRepository
                .countByUserIdInAndCreatedAtAfter(
                        followingIds,
                        LocalDateTime.now().minusDays(7)
                );

        return FeedStats.builder()
                .totalActivities(totalActivities)
                .todayActivities(todayActivities)
                .weekActivities(weekActivities)
                .followingCount(followingIds.size() - 1)
                .build();
    }

    /**
     * Refresh feed cache (for manual refresh)
     */
    public void refreshFeedCache(Long userId) {
        log.info("Refreshing feed cache for user {}", userId);
        // Cache will be automatically refreshed on next request
    }

    /**
     * Calculate engagement score for activity
     */
    private double calculateEngagementScore(Activity activity) {
        int likes = activity.getLikesCount() != null ? activity.getLikesCount() : 0;
        int comments = activity.getCommentsCount() != null ? activity.getCommentsCount() : 0;

        // Weight comments more than likes
        double score = (likes * 1.0) + (comments * 3.0);

        // Apply time decay (newer activities get bonus)
        long hoursSinceCreation = java.time.Duration.between(
                activity.getCreatedAt(),
                LocalDateTime.now()
        ).toHours();

        double timeDecayFactor = 1.0 / (1.0 + (hoursSinceCreation / 24.0));

        return score * timeDecayFactor;
    }

    /**
     * Convert Activity entity to FeedItemDTO
     */
    private ActivityFeedItemDTO convertToFeedItemDTO(Activity activity) {
        User user = activity.getUser();

        return ActivityFeedItemDTO.builder()
                .id(activity.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .userAvatarUrl(user.getAvatarUrl())
                .activityType(activity.getActivityType())
                .title(activity.getTitle())
                .description(activity.getDescription())
                .location(activity.getLocation())
                .distance(activity.getDistance())
                .duration(activity.getDuration())
                .difficulty(activity.getDifficulty())
                .imageUrls(activity.getImageUrls())
                .likesCount(activity.getLikesCount() != null ? activity.getLikesCount() : 0)
                .commentsCount(activity.getCommentsCount() != null ? activity.getCommentsCount() : 0)
                .isPrivate(activity.getIsPrivate())
                .createdAt(activity.getCreatedAt())
                .engagementScore(calculateEngagementScore(activity))
                .build();
    }
}

@lombok.Data
@lombok.Builder
class FeedStats {
    private long totalActivities;
    private long todayActivities;
    private long weekActivities;
    private long followingCount;
}
