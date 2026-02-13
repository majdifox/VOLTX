package com.voltx.repository;

import com.voltx.entity.Achievement;
import com.voltx.entity.User;
import com.voltx.entity.UserAchievement;
import com.voltx.enums.AchievementCategory;
import com.voltx.enums.AchievementRarity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserAchievement entity operations
 */
@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    /**
     * Find user achievement by user and achievement
     */
    Optional<UserAchievement> findByUserAndAchievement(User user, Achievement achievement);

    /**
     * Check if user has unlocked specific achievement
     */
    boolean existsByUserAndAchievement(User user, Achievement achievement);

    /**
     * Find all achievements unlocked by a user
     */
    List<UserAchievement> findByUserOrderByUnlockedAtDesc(User user);

    /**
     * Find user achievements with pagination
     */
    Page<UserAchievement> findByUser(User user, Pageable pageable);

    /**
     * Find user achievements by category
     */
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.user = :user AND ua.achievement.category = :category ORDER BY ua.unlockedAt DESC")
    List<UserAchievement> findByUserAndCategory(@Param("user") User user, @Param("category") AchievementCategory category);

    /**
     * Find user achievements by rarity
     */
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.user = :user AND ua.achievement.rarity = :rarity ORDER BY ua.unlockedAt DESC")
    List<UserAchievement> findByUserAndRarity(@Param("user") User user, @Param("rarity") AchievementRarity rarity);

    /**
     * Count total achievements unlocked by user
     */
    long countByUser(User user);

    /**
     * Count achievements by user and category
     */
    @Query("SELECT COUNT(ua) FROM UserAchievement ua WHERE ua.user = :user AND ua.achievement.category = :category")
    long countByUserAndCategory(@Param("user") User user, @Param("category") AchievementCategory category);

    /**
     * Count achievements by user and rarity
     */
    @Query("SELECT COUNT(ua) FROM UserAchievement ua WHERE ua.user = :user AND ua.achievement.rarity = :rarity")
    long countByUserAndRarity(@Param("user") User user, @Param("rarity") AchievementRarity rarity);

    /**
     * Calculate total points earned from achievements by user
     */
    @Query("SELECT COALESCE(SUM(ua.pointsEarned), 0) FROM UserAchievement ua WHERE ua.user = :user")
    Integer calculateTotalPointsEarned(@Param("user") User user);

    /**
     * Find recent achievements unlocked by user
     */
    List<UserAchievement> findByUserAndUnlockedAtAfterOrderByUnlockedAtDesc(User user, LocalDateTime after);

    /**
     * Find achievements unlocked today by user
     */
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.user = :user AND DATE(ua.unlockedAt) = CURRENT_DATE ORDER BY ua.unlockedAt DESC")
    List<UserAchievement> findTodayAchievements(@Param("user") User user);

    /**
     * Find unnotified achievements for user
     */
    List<UserAchievement> findByUserAndNotifiedFalse(User user);

    /**
     * Mark achievements as notified
     */
    @Query("UPDATE UserAchievement ua SET ua.notified = true WHERE ua.user = :user AND ua.notified = false")
    void markAllAsNotified(@Param("user") User user);

    /**
     * Get user achievement statistics
     */
    @Query("SELECT ua.achievement.category, COUNT(ua), SUM(ua.pointsEarned) FROM UserAchievement ua WHERE ua.user = :user GROUP BY ua.achievement.category")
    List<Object[]> getUserAchievementStatistics(@Param("user") User user);

    /**
     * Get user achievement progress (percentage of total achievements unlocked)
     */
    @Query("SELECT (COUNT(ua) * 100.0 / (SELECT COUNT(a) FROM Achievement a WHERE a.active = true)) " +
           "FROM UserAchievement ua WHERE ua.user = :user")
    Double getUserAchievementProgress(@Param("user") User user);

    /**
     * Find users who unlocked specific achievement
     */
    List<UserAchievement> findByAchievementOrderByUnlockedAtAsc(Achievement achievement);

    /**
     * Get achievement unlock rate (percentage of users who unlocked it)
     */
    @Query("SELECT (COUNT(ua) * 100.0 / (SELECT COUNT(u) FROM User u WHERE u.accountStatus = 'ACTIVE')) " +
           "FROM UserAchievement ua WHERE ua.achievement = :achievement")
    Double getAchievementUnlockRate(@Param("achievement") Achievement achievement);

    /**
     * Find top users by achievement count
     */
    @Query("SELECT ua.user, COUNT(ua) FROM UserAchievement ua GROUP BY ua.user ORDER BY COUNT(ua) DESC")
    List<Object[]> findTopUsersByAchievementCount(Pageable pageable);

    /**
     * Find top users by achievement points
     */
    @Query("SELECT ua.user, SUM(ua.pointsEarned) FROM UserAchievement ua GROUP BY ua.user ORDER BY SUM(ua.pointsEarned) DESC")
    List<Object[]> findTopUsersByAchievementPoints(Pageable pageable);

    /**
     * Find recently unlocked achievements across all users
     */
    @Query("SELECT ua FROM UserAchievement ua ORDER BY ua.unlockedAt DESC")
    List<UserAchievement> findRecentlyUnlockedAchievements(Pageable pageable);

    /**
     * Get achievement unlock timeline for user
     */
    @Query("SELECT DATE(ua.unlockedAt), COUNT(ua) FROM UserAchievement ua WHERE ua.user = :user GROUP BY DATE(ua.unlockedAt) ORDER BY DATE(ua.unlockedAt) DESC")
    List<Object[]> getUserAchievementTimeline(@Param("user") User user, Pageable pageable);
}
