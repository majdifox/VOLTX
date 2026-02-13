package com.voltx.service;

import com.voltx.entity.Achievement;
import com.voltx.entity.User;
import com.voltx.entity.UserAchievement;
import com.voltx.enums.AchievementCategory;
import com.voltx.enums.AchievementRarity;
import com.voltx.repository.AchievementRepository;
import com.voltx.repository.UserAchievementRepository;
import com.voltx.repository.UserRepository;
import com.voltx.util.LoggingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing achievements and user achievement progress
 */
@Service
@Transactional
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GamificationService gamificationService;

    /**
     * Unlock achievement for user
     */
    public UserAchievement unlockAchievement(String username, String achievementKey) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Achievement achievement = achievementRepository.findByAchievementKey(achievementKey)
            .orElseThrow(() -> new RuntimeException("Achievement not found: " + achievementKey));

        return unlockAchievement(user, achievement);
    }

    /**
     * Unlock achievement for user (entity version)
     */
    public UserAchievement unlockAchievement(User user, Achievement achievement) {
        return unlockAchievement(user, achievement, null);
    }

    /**
     * Unlock achievement for user with custom note
     */
    public UserAchievement unlockAchievement(User user, Achievement achievement, String unlockNote) {
        // Check if already unlocked
        if (userAchievementRepository.existsByUserAndAchievement(user, achievement)) {
            throw new RuntimeException("Achievement already unlocked: " + achievement.getAchievementKey());
        }

        // Calculate points earned (base points * rarity multiplier)
        int pointsEarned = achievement.getRarity().calculateReward(achievement.getPointsReward());

        // Create user achievement record
        UserAchievement userAchievement = new UserAchievement(user, achievement, pointsEarned, unlockNote);
        userAchievement.setProgressPercentage(100.0);
        userAchievement = userAchievementRepository.save(userAchievement);

        // Award points to user
        gamificationService.awardPoints(user, pointsEarned, "Achievement: " + achievement.getName());

        // Log achievement unlock
        LoggingUtil.logGamificationEvent(
            user.getUsername(),
            "ACHIEVEMENT_UNLOCKED",
            Map.of("achievement", achievement.getAchievementKey(), "points", pointsEarned)
        );

        // Check for chain achievements (achievements unlocked by unlocking this one)
        checkChainAchievements(user);

        return userAchievement;
    }

    /**
     * Check and unlock achievements based on user progress
     */
    public List<UserAchievement> checkAchievements(User user) {
        List<Achievement> availableAchievements = achievementRepository.findAvailableAchievementsForUser(
            user.getId(), user.getLevel()
        );

        return availableAchievements.stream()
            .filter(achievement -> meetsRequirements(user, achievement))
            .map(achievement -> unlockAchievement(user, achievement))
            .collect(Collectors.toList());
    }

    /**
     * Check if user meets achievement requirements
     */
    public boolean meetsRequirements(User user, Achievement achievement) {
        // Check level requirement
        if (achievement.getRequiredLevel() != null && user.getLevel() < achievement.getRequiredLevel()) {
            return false;
        }

        // Check points requirement
        if (achievement.getRequiredPoints() != null && user.getAdrenalinePoints() < achievement.getRequiredPoints()) {
            return false;
        }

        // Check login requirement
        if (achievement.getRequiredLogins() != null && user.getTotalLogins() < achievement.getRequiredLogins()) {
            return false;
        }

        // Additional custom requirement checks can be implemented here
        return checkCustomRequirements(user, achievement);
    }

    /**
     * Check custom requirements defined in JSON
     */
    private boolean checkCustomRequirements(User user, Achievement achievement) {
        // This would parse the requirementsJson field and check custom conditions
        // For now, return true (all custom requirements met)
        return true;
    }

    /**
     * Check for chain achievements (meta-achievements)
     */
    private void checkChainAchievements(User user) {
        // Check for achievements that require having other achievements
        long categoryCount = userAchievementRepository.countByUserAndCategory(user, AchievementCategory.PROGRESSION);

        // Example: "Achiever" - unlock 5 progression achievements
        if (categoryCount == 5) {
            Optional<Achievement> achieverAchievement = achievementRepository.findByAchievementKey("achiever");
            achieverAchievement.ifPresent(achievement -> {
                if (!userAchievementRepository.existsByUserAndAchievement(user, achievement)) {
                    unlockAchievement(user, achievement, "Unlocked 5 progression achievements");
                }
            });
        }
    }

    /**
     * Get user's achievement progress
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserAchievementProgress(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        long totalAchievements = achievementRepository.countByActiveTrueAndHiddenFalse();
        long unlockedAchievements = userAchievementRepository.countByUser(user);
        int totalPointsEarned = userAchievementRepository.calculateTotalPointsEarned(user);

        return Map.of(
            "totalAchievements", totalAchievements,
            "unlockedAchievements", unlockedAchievements,
            "progressPercentage", totalAchievements > 0 ? (unlockedAchievements * 100.0 / totalAchievements) : 0.0,
            "totalPointsEarned", totalPointsEarned,
            "recentAchievements", userAchievementRepository.findByUserAndUnlockedAtAfterOrderByUnlockedAtDesc(
                user, LocalDateTime.now().minusDays(7)
            )
        );
    }

    /**
     * Get achievements by category for user
     */
    @Transactional(readOnly = true)
    public List<UserAchievement> getUserAchievementsByCategory(String username, AchievementCategory category) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        return userAchievementRepository.findByUserAndCategory(user, category);
    }

    /**
     * Get available achievements for user
     */
    @Transactional(readOnly = true)
    public List<Achievement> getAvailableAchievements(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        return achievementRepository.findAvailableAchievementsForUser(user.getId(), user.getLevel());
    }

    /**
     * Get achievement leaderboard (top users by achievement points)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAchievementLeaderboard(Pageable pageable) {
        List<Object[]> results = userAchievementRepository.findTopUsersByAchievementPoints(pageable);

        return results.stream()
            .map(result -> Map.of(
                "user", result[0],
                "totalPoints", result[1],
                "achievementCount", userAchievementRepository.countByUser((User) result[0])
            ))
            .collect(Collectors.toList());
    }

    /**
     * Create new achievement (admin function)
     */
    public Achievement createAchievement(String key, String name, String description,
                                       AchievementCategory category, AchievementRarity rarity,
                                       int basePoints) {
        if (achievementRepository.existsByAchievementKey(key)) {
            throw new RuntimeException("Achievement key already exists: " + key);
        }

        Achievement achievement = new Achievement(key, name, description, category, rarity, basePoints);
        return achievementRepository.save(achievement);
    }

    /**
     * Get achievement statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAchievementStatistics() {
        List<Object[]> categoryStats = achievementRepository.getAchievementStatistics();

        return Map.of(
            "totalAchievements", achievementRepository.countByActiveTrueAndHiddenFalse(),
            "categoryStatistics", categoryStats.stream()
                .collect(Collectors.toMap(
                    stat -> ((AchievementCategory) stat[0]).getDisplayName(),
                    stat -> Map.of("count", stat[1], "averagePoints", stat[2])
                )),
            "rarityDistribution", getRarityDistribution()
        );
    }

    /**
     * Get rarity distribution
     */
    private Map<String, Long> getRarityDistribution() {
        Map<String, Long> distribution = new java.util.HashMap<>();
        for (AchievementRarity rarity : AchievementRarity.values()) {
            distribution.put(rarity.getDisplayName(),
                achievementRepository.countByActiveTrueAndRarity(rarity));
        }
        return distribution;
    }

    /**
     * Mark achievement notifications as sent
     */
    public void markNotificationsAsSent(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        userAchievementRepository.markAllAsNotified(user);
    }

    /**
     * Get recent achievement activity across all users
     */
    @Transactional(readOnly = true)
    public List<UserAchievement> getRecentAchievementActivity(Pageable pageable) {
        return userAchievementRepository.findRecentlyUnlockedAchievements(pageable);
    }
}
