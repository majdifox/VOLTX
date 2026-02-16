package com.voltx.service;

import com.voltx.dto.UserProfileDTO;
import com.voltx.entity.Follow;
import com.voltx.entity.User;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.FollowRepository;
import com.voltx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing user following/followers relationships
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Follow a user
     */
    @Transactional
    @CacheEvict(value = {"followers", "following", "followStats"}, allEntries = true)
    public void followUser(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Follower user not found"));

        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Following user not found"));

        // Check if already following
        Optional<Follow> existingFollow = followRepository
                .findByFollowerIdAndFollowingId(followerId, followingId);

        if (existingFollow.isPresent()) {
            throw new IllegalArgumentException("Already following this user");
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .createdAt(LocalDateTime.now())
                .build();

        followRepository.save(follow);
        log.info("User {} started following user {}", followerId, followingId);

        // Send notification to followed user
        notificationService.notifyNewFollower(following, follower);
    }

    /**
     * Unfollow a user
     */
    @Transactional
    @CacheEvict(value = {"followers", "following", "followStats"}, allEntries = true)
    public void unfollowUser(Long followerId, Long followingId) {
        Follow follow = followRepository
                .findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow relationship not found"));

        followRepository.delete(follow);
        log.info("User {} unfollowed user {}", followerId, followingId);
    }

    /**
     * Check if user is following another user
     */
    @Cacheable(value = "followCheck", key = "#followerId + '-' + #followingId")
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    /**
     * Get followers of a user with pagination
     */
    @Cacheable(value = "followers", key = "#userId + '-' + #pageable.pageNumber")
    public Page<UserProfileDTO> getFollowers(Long userId, Pageable pageable) {
        Page<Follow> follows = followRepository.findByFollowingId(userId, pageable);
        return follows.map(follow -> convertToUserProfileDTO(follow.getFollower()));
    }

    /**
     * Get users that a user is following with pagination
     */
    @Cacheable(value = "following", key = "#userId + '-' + #pageable.pageNumber")
    public Page<UserProfileDTO> getFollowing(Long userId, Pageable pageable) {
        Page<Follow> follows = followRepository.findByFollowerId(userId, pageable);
        return follows.map(follow -> convertToUserProfileDTO(follow.getFollowing()));
    }

    /**
     * Get all followers (non-paginated)
     */
    public List<UserProfileDTO> getAllFollowers(Long userId) {
        return followRepository.findByFollowingId(userId)
                .stream()
                .map(follow -> convertToUserProfileDTO(follow.getFollower()))
                .collect(Collectors.toList());
    }

    /**
     * Get all following (non-paginated)
     */
    public List<UserProfileDTO> getAllFollowing(Long userId) {
        return followRepository.findByFollowerId(userId)
                .stream()
                .map(follow -> convertToUserProfileDTO(follow.getFollowing()))
                .collect(Collectors.toList());
    }

    /**
     * Get follower count
     */
    @Cacheable(value = "followerCount", key = "#userId")
    public long getFollowerCount(Long userId) {
        return followRepository.countByFollowingId(userId);
    }

    /**
     * Get following count
     */
    @Cacheable(value = "followingCount", key = "#userId")
    public long getFollowingCount(Long userId) {
        return followRepository.countByFollowerId(userId);
    }

    /**
     * Get follow statistics for a user
     */
    @Cacheable(value = "followStats", key = "#userId")
    public FollowStats getFollowStats(Long userId) {
        long followerCount = followRepository.countByFollowingId(userId);
        long followingCount = followRepository.countByFollowerId(userId);

        // Calculate mutual follows (users who follow each other)
        List<Follow> followers = followRepository.findByFollowingId(userId);
        List<Follow> following = followRepository.findByFollowerId(userId);

        long mutualCount = followers.stream()
                .filter(followerFollow ->
                        following.stream()
                                .anyMatch(followingFollow ->
                                        followingFollow.getFollowing().getId()
                                                .equals(followerFollow.getFollower().getId())
                                )
                )
                .count();

        return FollowStats.builder()
                .followerCount(followerCount)
                .followingCount(followingCount)
                .mutualCount(mutualCount)
                .build();
    }

    /**
     * Get suggested users to follow based on mutual connections
     */
    public List<UserProfileDTO> getSuggestedUsers(Long userId, int limit) {
        // Get users followed by people you follow (friends of friends)
        List<Follow> myFollowing = followRepository.findByFollowerId(userId);

        return myFollowing.stream()
                .flatMap(follow -> followRepository.findByFollowerId(follow.getFollowing().getId()).stream())
                .map(Follow::getFollowing)
                .filter(user -> !user.getId().equals(userId)) // Not yourself
                .filter(user -> !isFollowing(userId, user.getId())) // Not already following
                .distinct()
                .limit(limit)
                .map(this::convertToUserProfileDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get mutual followers (users who follow each other)
     */
    public List<UserProfileDTO> getMutualFollowers(Long userId1, Long userId2) {
        List<Long> user1Followers = followRepository.findByFollowingId(userId1)
                .stream()
                .map(follow -> follow.getFollower().getId())
                .collect(Collectors.toList());

        List<Long> user2Followers = followRepository.findByFollowingId(userId2)
                .stream()
                .map(follow -> follow.getFollower().getId())
                .collect(Collectors.toList());

        return user1Followers.stream()
                .filter(user2Followers::contains)
                .map(id -> userRepository.findById(id).orElse(null))
                .filter(user -> user != null)
                .map(this::convertToUserProfileDTO)
                .collect(Collectors.toList());
    }

    /**
     * Remove follower (block user from following)
     */
    @Transactional
    @CacheEvict(value = {"followers", "following", "followStats"}, allEntries = true)
    public void removeFollower(Long userId, Long followerId) {
        Follow follow = followRepository
                .findByFollowerIdAndFollowingId(followerId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow relationship not found"));

        followRepository.delete(follow);
        log.info("User {} removed follower {}", userId, followerId);
    }

    /**
     * Batch follow multiple users
     */
    @Transactional
    @CacheEvict(value = {"followers", "following", "followStats"}, allEntries = true)
    public void followMultipleUsers(Long followerId, List<Long> followingIds) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Follower user not found"));

        followingIds.stream()
                .filter(id -> !id.equals(followerId)) // Can't follow yourself
                .filter(id -> !isFollowing(followerId, id)) // Not already following
                .forEach(followingId -> {
                    User following = userRepository.findById(followingId).orElse(null);
                    if (following != null) {
                        Follow follow = Follow.builder()
                                .follower(follower)
                                .following(following)
                                .createdAt(LocalDateTime.now())
                                .build();
                        followRepository.save(follow);
                        notificationService.notifyNewFollower(following, follower);
                    }
                });

        log.info("User {} followed {} users", followerId, followingIds.size());
    }

    /**
     * Get recent followers (last 7 days)
     */
    public List<UserProfileDTO> getRecentFollowers(Long userId, int limit) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        return followRepository.findByFollowingIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, cutoffDate)
                .stream()
                .limit(limit)
                .map(follow -> convertToUserProfileDTO(follow.getFollower()))
                .collect(Collectors.toList());
    }

    private UserProfileDTO convertToUserProfileDTO(User user) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .level(user.getLevel())
                .points(user.getPoints())
                .followerCount(getFollowerCount(user.getId()))
                .followingCount(getFollowingCount(user.getId()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}

@lombok.Data
@lombok.Builder
class FollowStats {
    private long followerCount;
    private long followingCount;
    private long mutualCount;
}
