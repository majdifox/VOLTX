package com.voltx.repository;

import com.voltx.entity.Achievement;
import com.voltx.enums.AchievementCategory;
import com.voltx.enums.AchievementRarity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Achievement entity operations
 */
@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    /**
     * Find achievement by unique key
     */
    Optional<Achievement> findByAchievementKey(String achievementKey);

    /**
     * Check if achievement exists by key
     */
    boolean existsByAchievementKey(String achievementKey);

    /**
     * Find all active achievements
     */
    List<Achievement> findByActiveTrue();

    /**
     * Find active achievements by category
     */
    List<Achievement> findByActiveTrueAndCategory(AchievementCategory category);

    /**
     * Find active achievements by rarity
     */
    List<Achievement> findByActiveTrueAndRarity(AchievementRarity rarity);

    /**
     * Find active, non-hidden achievements ordered by sort order
     */
    List<Achievement> findByActiveTrueAndHiddenFalseOrderBySortOrderAsc();

    /**
     * Find achievements by category with pagination
     */
    Page<Achievement> findByActiveTrueAndCategory(AchievementCategory category, Pageable pageable);

    /**
     * Find achievements by rarity with pagination
     */
    Page<Achievement> findByActiveTrueAndRarity(AchievementRarity rarity, Pageable pageable);

    /**
     * Find achievements that a user can potentially unlock based on level requirement
     */
    @Query("SELECT a FROM Achievement a WHERE a.active = true AND " +
           "(a.requiredLevel IS NULL OR a.requiredLevel <= :userLevel) AND " +
           "a.id NOT IN (SELECT ua.achievement.id FROM UserAchievement ua WHERE ua.user.id = :userId)")
    List<Achievement> findAvailableAchievementsForUser(@Param("userId") Long userId,
                                                       @Param("userLevel") Integer userLevel);

    /**
     * Search achievements by name or description
     */
    @Query("SELECT a FROM Achievement a WHERE a.active = true AND " +
           "(LOWER(a.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Achievement> searchAchievements(@Param("searchTerm") String searchTerm);

    /**
     * Count achievements by category
     */
    long countByActiveTrueAndCategory(AchievementCategory category);

    /**
     * Count achievements by rarity
     */
    long countByActiveTrueAndRarity(AchievementRarity rarity);

    /**
     * Find achievements with point requirements
     */
    @Query("SELECT a FROM Achievement a WHERE a.active = true AND a.requiredPoints IS NOT NULL AND a.requiredPoints <= :userPoints")
    List<Achievement> findByPointsRequirement(@Param("userPoints") Integer userPoints);

    /**
     * Find achievements with login requirements
     */
    @Query("SELECT a FROM Achievement a WHERE a.active = true AND a.requiredLogins IS NOT NULL AND a.requiredLogins <= :userLogins")
    List<Achievement> findByLoginsRequirement(@Param("userLogins") Integer userLogins);

    /**
     * Get achievement statistics
     */
    @Query("SELECT a.category, COUNT(a), AVG(a.pointsReward) FROM Achievement a WHERE a.active = true GROUP BY a.category")
    List<Object[]> getAchievementStatistics();

    /**
     * Find top achievements by points reward
     */
    @Query("SELECT a FROM Achievement a WHERE a.active = true ORDER BY a.pointsReward DESC")
    List<Achievement> findTopByPointsReward(Pageable pageable);

    /**
     * Find recently created achievements
     */
    @Query("SELECT a FROM Achievement a WHERE a.active = true ORDER BY a.createdAt DESC")
    List<Achievement> findRecentAchievements(Pageable pageable);
}
