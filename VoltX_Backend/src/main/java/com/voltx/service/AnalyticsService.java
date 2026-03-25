package com.voltx.service;

import com.voltx.entity.User;
import com.voltx.entity.Activity;
import com.voltx.entity.Achievement;
import com.voltx.entity.UserAchievement;
import com.voltx.repository.UserRepository;
import com.voltx.repository.ActivityRepository;
import com.voltx.repository.AchievementRepository;
import com.voltx.repository.UserAchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Advanced analytics service providing comprehensive platform insights
 */
@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;

    @Autowired
    public AnalyticsService(UserRepository userRepository,
                          ActivityRepository activityRepository,
                          AchievementRepository achievementRepository,
                          UserAchievementRepository userAchievementRepository) {
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
    }

    /**
     * Get comprehensive platform overview
     */
    @Cacheable(value = "analytics", key = "'platform-overview'")
    public PlatformOverview getPlatformOverview() {
        PlatformOverview overview = new PlatformOverview();

        // User metrics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("ACTIVE");
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(
            LocalDateTime.now().minusMonths(1)
        );

        overview.setTotalUsers(totalUsers);
        overview.setActiveUsers(activeUsers);
        overview.setNewUsersThisMonth(newUsersThisMonth);
        overview.setUserGrowthRate(calculateGrowthRate(newUsersThisMonth, totalUsers));

        // Activity metrics
        long totalActivities = activityRepository.count();
        long upcomingActivities = activityRepository.countByActivityDateAfter(LocalDateTime.now());
        long activitiesThisMonth = activityRepository.countByCreatedAtAfter(
            LocalDateTime.now().minusMonths(1)
        );

        overview.setTotalActivities(totalActivities);
        overview.setUpcomingActivities(upcomingActivities);
        overview.setActivitiesThisMonth(activitiesThisMonth);
        overview.setActivityGrowthRate(calculateGrowthRate(activitiesThisMonth, totalActivities));

        // Achievement metrics
        long totalAchievements = achievementRepository.count();
        long totalUserAchievements = userAchievementRepository.count();
        double avgAchievementsPerUser = totalUsers > 0 ? (double) totalUserAchievements / totalUsers : 0;

        overview.setTotalAchievements(totalAchievements);
        overview.setTotalUserAchievements(totalUserAchievements);
        overview.setAvgAchievementsPerUser(avgAchievementsPerUser);

        // Engagement metrics
        double avgActivitiesPerUser = totalUsers > 0 ? (double) totalActivities / totalUsers : 0;
        overview.setAvgActivitiesPerUser(avgActivitiesPerUser);
        overview.setEngagementScore(calculateEngagementScore(activeUsers, totalUsers, avgAchievementsPerUser));

        return overview;
    }

    /**
     * Get user analytics with detailed breakdowns
     */
    @Cacheable(value = "analytics", key = "'user-analytics'")
    public UserAnalytics getUserAnalytics() {
        UserAnalytics analytics = new UserAnalytics();

        List<User> allUsers = userRepository.findAll();

        // Status distribution
        Map<String, Long> statusDistribution = allUsers.stream()
            .collect(Collectors.groupingBy(User::getStatus, Collectors.counting()));
        analytics.setStatusDistribution(statusDistribution);

        // Level distribution
        Map<String, Long> levelDistribution = allUsers.stream()
            .collect(Collectors.groupingBy(
                user -> "Level " + user.getLevel(),
                Collectors.counting()
            ));
        analytics.setLevelDistribution(levelDistribution);

        // Points distribution (ranges)
        Map<String, Long> pointsDistribution = allUsers.stream()
            .collect(Collectors.groupingBy(
                this::getPointsRange,
                Collectors.counting()
            ));
        analytics.setPointsDistribution(pointsDistribution);

        // Registration timeline
        analytics.setRegistrationTimeline(getUserRegistrationTimeline());

        // Top users by points
        List<TopUserDto> topUsers = allUsers.stream()
            .sorted((u1, u2) -> Integer.compare(u2.getAdrenalinePoints(), u1.getAdrenalinePoints()))
            .limit(10)
            .map(this::mapToTopUserDto)
            .collect(Collectors.toList());
        analytics.setTopUsers(topUsers);

        return analytics;
    }

    /**
     * Get activity analytics
     */
    @Cacheable(value = "analytics", key = "'activity-analytics'")
    public ActivityAnalytics getActivityAnalytics() {
        ActivityAnalytics analytics = new ActivityAnalytics();

        List<Activity> allActivities = activityRepository.findAll();

        // Category distribution
        Map<String, Long> categoryDistribution = allActivities.stream()
            .filter(activity -> activity.getCategory() != null)
            .collect(Collectors.groupingBy(
                activity -> activity.getCategory().toString(),
                Collectors.counting()
            ));
        analytics.setCategoryDistribution(categoryDistribution);

        // Difficulty distribution
        Map<String, Long> difficultyDistribution = allActivities.stream()
            .filter(activity -> activity.getDifficulty() != null)
            .collect(Collectors.groupingBy(
                activity -> activity.getDifficulty().toString(),
                Collectors.counting()
            ));
        analytics.setDifficultyDistribution(difficultyDistribution);

        // Monthly activity creation
        analytics.setMonthlyCreation(getActivityCreationTimeline());

        // Popular activities
        List<PopularActivityDto> popularActivities = allActivities.stream()
            .sorted((a1, a2) -> Integer.compare(a2.getCurrentParticipants(), a1.getCurrentParticipants()))
            .limit(10)
            .map(this::mapToPopularActivityDto)
            .collect(Collectors.toList());
        analytics.setPopularActivities(popularActivities);

        // Capacity utilization
        OptionalDouble avgCapacityUtilization = allActivities.stream()
            .filter(activity -> activity.getMaxParticipants() > 0)
            .mapToDouble(activity -> (double) activity.getCurrentParticipants() / activity.getMaxParticipants())
            .average();
        analytics.setAvgCapacityUtilization(avgCapacityUtilization.orElse(0.0) * 100);

        return analytics;
    }

    /**
     * Get achievement analytics
     */
    @Cacheable(value = "analytics", key = "'achievement-analytics'")
    public AchievementAnalytics getAchievementAnalytics() {
        AchievementAnalytics analytics = new AchievementAnalytics();

        List<Achievement> allAchievements = achievementRepository.findAll();
        List<UserAchievement> allUserAchievements = userAchievementRepository.findAll();

        // Rarity distribution
        Map<String, Long> rarityDistribution = allAchievements.stream()
            .filter(achievement -> achievement.getRarity() != null)
            .collect(Collectors.groupingBy(
                achievement -> achievement.getRarity().toString(),
                Collectors.counting()
            ));
        analytics.setRarityDistribution(rarityDistribution);

        // Category distribution
        Map<String, Long> categoryDistribution = allAchievements.stream()
            .filter(achievement -> achievement.getCategory() != null)
            .collect(Collectors.groupingBy(
                achievement -> achievement.getCategory().toString(),
                Collectors.counting()
            ));
        analytics.setCategoryDistribution(categoryDistribution);

        // Completion rates
        Map<String, Double> completionRates = allAchievements.stream()
            .collect(Collectors.toMap(
                Achievement::getName,
                achievement -> calculateCompletionRate(achievement, allUserAchievements)
            ));
        analytics.setCompletionRates(completionRates);

        // Most earned achievements
        List<PopularAchievementDto> mostEarned = allAchievements.stream()
            .map(achievement -> {
                long earnedCount = allUserAchievements.stream()
                    .mapToLong(ua -> ua.getAchievement().getId().equals(achievement.getId()) ? 1 : 0)
                    .sum();
                return new PopularAchievementDto(
                    achievement.getName(),
                    achievement.getDescription(),
                    achievement.getRarity().toString(),
                    earnedCount,
                    calculateCompletionRate(achievement, allUserAchievements)
                );
            })
            .sorted((a1, a2) -> Long.compare(a2.getEarnedCount(), a1.getEarnedCount()))
            .limit(10)
            .collect(Collectors.toList());
        analytics.setMostEarnedAchievements(mostEarned);

        // Achievement earning timeline
        analytics.setEarningTimeline(getAchievementEarningTimeline());

        return analytics;
    }

    /**
     * Get engagement metrics
     */
    @Cacheable(value = "analytics", key = "'engagement-metrics'")
    public EngagementMetrics getEngagementMetrics() {
        EngagementMetrics metrics = new EngagementMetrics();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("ACTIVE");

        // Daily active users (simulated - would require login tracking)
        List<DailyEngagement> dailyEngagement = generateDailyEngagementData();
        metrics.setDailyEngagement(dailyEngagement);

        // User retention (simplified calculation)
        double retentionRate = totalUsers > 0 ? (double) activeUsers / totalUsers * 100 : 0;
        metrics.setRetentionRate(retentionRate);

        // Feature usage
        Map<String, Long> featureUsage = new HashMap<>();
        featureUsage.put("Activities Created", activityRepository.count());
        featureUsage.put("Achievements Earned", userAchievementRepository.count());
        featureUsage.put("User Registrations", totalUsers);
        metrics.setFeatureUsage(featureUsage);

        // Engagement score by user level
        Map<String, Double> engagementByLevel = userRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                user -> "Level " + user.getLevel(),
                Collectors.averagingInt(User::getAdrenalinePoints)
            ));
        metrics.setEngagementByLevel(engagementByLevel);

        return metrics;
    }

    /**
     * Get real-time metrics
     */
    public RealTimeMetrics getRealTimeMetrics() {
        RealTimeMetrics metrics = new RealTimeMetrics();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime hourAgo = now.minusHours(1);
        LocalDateTime dayAgo = now.minusDays(1);

        // New registrations
        long newUsersLastHour = userRepository.countByCreatedAtAfter(hourAgo);
        long newUsersLastDay = userRepository.countByCreatedAtAfter(dayAgo);

        metrics.setNewUsersLastHour(newUsersLastHour);
        metrics.setNewUsersLastDay(newUsersLastDay);

        // Active activities
        long activeActivities = activityRepository.countByStatus("ACTIVE");
        long upcomingActivities = activityRepository.countByActivityDateAfter(now);

        metrics.setActiveActivities(activeActivities);
        metrics.setUpcomingActivities(upcomingActivities);

        // Recent achievements
        long recentAchievements = userAchievementRepository.countByEarnedDateAfter(dayAgo);
        metrics.setRecentAchievements(recentAchievements);

        // System health indicators
        metrics.setSystemHealth(calculateSystemHealth());

        return metrics;
    }

    // Private helper methods

    private double calculateGrowthRate(long newCount, long total) {
        return total > 0 ? (double) newCount / total * 100 : 0;
    }

    private double calculateEngagementScore(long activeUsers, long totalUsers, double avgAchievements) {
        double activityRate = totalUsers > 0 ? (double) activeUsers / totalUsers : 0;
        return (activityRate * 0.7 + (avgAchievements / 10) * 0.3) * 100;
    }

    private String getPointsRange(User user) {
        int points = user.getAdrenalinePoints();
        if (points < 100) return "0-99";
        if (points < 500) return "100-499";
        if (points < 1000) return "500-999";
        if (points < 5000) return "1000-4999";
        return "5000+";
    }

    private double calculateCompletionRate(Achievement achievement, List<UserAchievement> userAchievements) {
        long totalUsers = userRepository.count();
        if (totalUsers == 0) return 0;

        long completionCount = userAchievements.stream()
            .mapToLong(ua -> ua.getAchievement().getId().equals(achievement.getId()) ? 1 : 0)
            .sum();

        return (double) completionCount / totalUsers * 100;
    }

    private List<TimelineDto> getUserRegistrationTimeline() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        return IntStream.range(0, 6)
            .mapToObj(i -> {
                LocalDateTime monthStart = sixMonthsAgo.plusMonths(i);
                LocalDateTime monthEnd = monthStart.plusMonths(1);

                long count = userRepository.countByCreatedAtBetween(monthStart, monthEnd);

                return new TimelineDto(
                    monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")),
                    count
                );
            })
            .collect(Collectors.toList());
    }

    private List<TimelineDto> getActivityCreationTimeline() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        return IntStream.range(0, 6)
            .mapToObj(i -> {
                LocalDateTime monthStart = sixMonthsAgo.plusMonths(i);
                LocalDateTime monthEnd = monthStart.plusMonths(1);

                long count = activityRepository.countByCreatedAtBetween(monthStart, monthEnd);

                return new TimelineDto(
                    monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")),
                    count
                );
            })
            .collect(Collectors.toList());
    }

    private List<TimelineDto> getAchievementEarningTimeline() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        return IntStream.range(0, 6)
            .mapToObj(i -> {
                LocalDateTime monthStart = sixMonthsAgo.plusMonths(i);
                LocalDateTime monthEnd = monthStart.plusMonths(1);

                long count = userAchievementRepository.countByEarnedDateBetween(monthStart, monthEnd);

                return new TimelineDto(
                    monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")),
                    count
                );
            })
            .collect(Collectors.toList());
    }

    private List<DailyEngagement> generateDailyEngagementData() {
        // Simplified simulation - in production, this would come from real tracking data
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        return IntStream.range(0, 30)
            .mapToObj(i -> {
                LocalDateTime day = thirtyDaysAgo.plusDays(i);
                // Simulate engagement data with some patterns
                long activeUsers = (long) (Math.random() * 100 + 50);
                long newUsers = (long) (Math.random() * 20);
                long activities = (long) (Math.random() * 30 + 10);

                return new DailyEngagement(
                    day.toLocalDate(),
                    activeUsers,
                    newUsers,
                    activities
                );
            })
            .collect(Collectors.toList());
    }

    private TopUserDto mapToTopUserDto(User user) {
        return new TopUserDto(
            user.getUsername(),
            user.getLevel(),
            user.getAdrenalinePoints(),
            userAchievementRepository.countByUser(user)
        );
    }

    private PopularActivityDto mapToPopularActivityDto(Activity activity) {
        return new PopularActivityDto(
            activity.getTitle(),
            activity.getCategory() != null ? activity.getCategory().toString() : "Unknown",
            activity.getDifficulty() != null ? activity.getDifficulty().toString() : "Unknown",
            activity.getCurrentParticipants(),
            activity.getMaxParticipants()
        );
    }

    private SystemHealthDto calculateSystemHealth() {
        // Simplified system health calculation
        double cpuUsage = Math.random() * 100; // Simulated
        double memoryUsage = Math.random() * 100; // Simulated
        double diskUsage = Math.random() * 100; // Simulated

        String status = "HEALTHY";
        if (cpuUsage > 90 || memoryUsage > 90 || diskUsage > 95) {
            status = "CRITICAL";
        } else if (cpuUsage > 70 || memoryUsage > 70 || diskUsage > 80) {
            status = "WARNING";
        }

        return new SystemHealthDto(status, cpuUsage, memoryUsage, diskUsage);
    }

    // DTO Classes

    public static class PlatformOverview {
        private long totalUsers;
        private long activeUsers;
        private long newUsersThisMonth;
        private double userGrowthRate;
        private long totalActivities;
        private long upcomingActivities;
        private long activitiesThisMonth;
        private double activityGrowthRate;
        private long totalAchievements;
        private long totalUserAchievements;
        private double avgAchievementsPerUser;
        private double avgActivitiesPerUser;
        private double engagementScore;

        // Getters and Setters
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

        public long getActiveUsers() { return activeUsers; }
        public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

        public long getNewUsersThisMonth() { return newUsersThisMonth; }
        public void setNewUsersThisMonth(long newUsersThisMonth) { this.newUsersThisMonth = newUsersThisMonth; }

        public double getUserGrowthRate() { return userGrowthRate; }
        public void setUserGrowthRate(double userGrowthRate) { this.userGrowthRate = userGrowthRate; }

        public long getTotalActivities() { return totalActivities; }
        public void setTotalActivities(long totalActivities) { this.totalActivities = totalActivities; }

        public long getUpcomingActivities() { return upcomingActivities; }
        public void setUpcomingActivities(long upcomingActivities) { this.upcomingActivities = upcomingActivities; }

        public long getActivitiesThisMonth() { return activitiesThisMonth; }
        public void setActivitiesThisMonth(long activitiesThisMonth) { this.activitiesThisMonth = activitiesThisMonth; }

        public double getActivityGrowthRate() { return activityGrowthRate; }
        public void setActivityGrowthRate(double activityGrowthRate) { this.activityGrowthRate = activityGrowthRate; }

        public long getTotalAchievements() { return totalAchievements; }
        public void setTotalAchievements(long totalAchievements) { this.totalAchievements = totalAchievements; }

        public long getTotalUserAchievements() { return totalUserAchievements; }
        public void setTotalUserAchievements(long totalUserAchievements) { this.totalUserAchievements = totalUserAchievements; }

        public double getAvgAchievementsPerUser() { return avgAchievementsPerUser; }
        public void setAvgAchievementsPerUser(double avgAchievementsPerUser) { this.avgAchievementsPerUser = avgAchievementsPerUser; }

        public double getAvgActivitiesPerUser() { return avgActivitiesPerUser; }
        public void setAvgActivitiesPerUser(double avgActivitiesPerUser) { this.avgActivitiesPerUser = avgActivitiesPerUser; }

        public double getEngagementScore() { return engagementScore; }
        public void setEngagementScore(double engagementScore) { this.engagementScore = engagementScore; }
    }

    public static class UserAnalytics {
        private Map<String, Long> statusDistribution;
        private Map<String, Long> levelDistribution;
        private Map<String, Long> pointsDistribution;
        private List<TimelineDto> registrationTimeline;
        private List<TopUserDto> topUsers;

        // Getters and Setters
        public Map<String, Long> getStatusDistribution() { return statusDistribution; }
        public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }

        public Map<String, Long> getLevelDistribution() { return levelDistribution; }
        public void setLevelDistribution(Map<String, Long> levelDistribution) { this.levelDistribution = levelDistribution; }

        public Map<String, Long> getPointsDistribution() { return pointsDistribution; }
        public void setPointsDistribution(Map<String, Long> pointsDistribution) { this.pointsDistribution = pointsDistribution; }

        public List<TimelineDto> getRegistrationTimeline() { return registrationTimeline; }
        public void setRegistrationTimeline(List<TimelineDto> registrationTimeline) { this.registrationTimeline = registrationTimeline; }

        public List<TopUserDto> getTopUsers() { return topUsers; }
        public void setTopUsers(List<TopUserDto> topUsers) { this.topUsers = topUsers; }
    }

    public static class ActivityAnalytics {
        private Map<String, Long> categoryDistribution;
        private Map<String, Long> difficultyDistribution;
        private List<TimelineDto> monthlyCreation;
        private List<PopularActivityDto> popularActivities;
        private double avgCapacityUtilization;

        // Getters and Setters
        public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
        public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

        public Map<String, Long> getDifficultyDistribution() { return difficultyDistribution; }
        public void setDifficultyDistribution(Map<String, Long> difficultyDistribution) { this.difficultyDistribution = difficultyDistribution; }

        public List<TimelineDto> getMonthlyCreation() { return monthlyCreation; }
        public void setMonthlyCreation(List<TimelineDto> monthlyCreation) { this.monthlyCreation = monthlyCreation; }

        public List<PopularActivityDto> getPopularActivities() { return popularActivities; }
        public void setPopularActivities(List<PopularActivityDto> popularActivities) { this.popularActivities = popularActivities; }

        public double getAvgCapacityUtilization() { return avgCapacityUtilization; }
        public void setAvgCapacityUtilization(double avgCapacityUtilization) { this.avgCapacityUtilization = avgCapacityUtilization; }
    }

    public static class AchievementAnalytics {
        private Map<String, Long> rarityDistribution;
        private Map<String, Long> categoryDistribution;
        private Map<String, Double> completionRates;
        private List<PopularAchievementDto> mostEarnedAchievements;
        private List<TimelineDto> earningTimeline;

        // Getters and Setters
        public Map<String, Long> getRarityDistribution() { return rarityDistribution; }
        public void setRarityDistribution(Map<String, Long> rarityDistribution) { this.rarityDistribution = rarityDistribution; }

        public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
        public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

        public Map<String, Double> getCompletionRates() { return completionRates; }
        public void setCompletionRates(Map<String, Double> completionRates) { this.completionRates = completionRates; }

        public List<PopularAchievementDto> getMostEarnedAchievements() { return mostEarnedAchievements; }
        public void setMostEarnedAchievements(List<PopularAchievementDto> mostEarnedAchievements) { this.mostEarnedAchievements = mostEarnedAchievements; }

        public List<TimelineDto> getEarningTimeline() { return earningTimeline; }
        public void setEarningTimeline(List<TimelineDto> earningTimeline) { this.earningTimeline = earningTimeline; }
    }

    public static class EngagementMetrics {
        private List<DailyEngagement> dailyEngagement;
        private double retentionRate;
        private Map<String, Long> featureUsage;
        private Map<String, Double> engagementByLevel;

        // Getters and Setters
        public List<DailyEngagement> getDailyEngagement() { return dailyEngagement; }
        public void setDailyEngagement(List<DailyEngagement> dailyEngagement) { this.dailyEngagement = dailyEngagement; }

        public double getRetentionRate() { return retentionRate; }
        public void setRetentionRate(double retentionRate) { this.retentionRate = retentionRate; }

        public Map<String, Long> getFeatureUsage() { return featureUsage; }
        public void setFeatureUsage(Map<String, Long> featureUsage) { this.featureUsage = featureUsage; }

        public Map<String, Double> getEngagementByLevel() { return engagementByLevel; }
        public void setEngagementByLevel(Map<String, Double> engagementByLevel) { this.engagementByLevel = engagementByLevel; }
    }

    public static class RealTimeMetrics {
        private long newUsersLastHour;
        private long newUsersLastDay;
        private long activeActivities;
        private long upcomingActivities;
        private long recentAchievements;
        private SystemHealthDto systemHealth;

        // Getters and Setters
        public long getNewUsersLastHour() { return newUsersLastHour; }
        public void setNewUsersLastHour(long newUsersLastHour) { this.newUsersLastHour = newUsersLastHour; }

        public long getNewUsersLastDay() { return newUsersLastDay; }
        public void setNewUsersLastDay(long newUsersLastDay) { this.newUsersLastDay = newUsersLastDay; }

        public long getActiveActivities() { return activeActivities; }
        public void setActiveActivities(long activeActivities) { this.activeActivities = activeActivities; }

        public long getUpcomingActivities() { return upcomingActivities; }
        public void setUpcomingActivities(long upcomingActivities) { this.upcomingActivities = upcomingActivities; }

        public long getRecentAchievements() { return recentAchievements; }
        public void setRecentAchievements(long recentAchievements) { this.recentAchievements = recentAchievements; }

        public SystemHealthDto getSystemHealth() { return systemHealth; }
        public void setSystemHealth(SystemHealthDto systemHealth) { this.systemHealth = systemHealth; }
    }

    // Supporting DTOs
    public static class TimelineDto {
        private String period;
        private long count;

        public TimelineDto(String period, long count) {
            this.period = period;
            this.count = count;
        }

        public String getPeriod() { return period; }
        public long getCount() { return count; }
    }

    public static class TopUserDto {
        private String username;
        private int level;
        private int adrenalinePoints;
        private long achievementCount;

        public TopUserDto(String username, int level, int adrenalinePoints, long achievementCount) {
            this.username = username;
            this.level = level;
            this.adrenalinePoints = adrenalinePoints;
            this.achievementCount = achievementCount;
        }

        public String getUsername() { return username; }
        public int getLevel() { return level; }
        public int getAdrenalinePoints() { return adrenalinePoints; }
        public long getAchievementCount() { return achievementCount; }
    }

    public static class PopularActivityDto {
        private String title;
        private String category;
        private String difficulty;
        private int currentParticipants;
        private int maxParticipants;

        public PopularActivityDto(String title, String category, String difficulty, int currentParticipants, int maxParticipants) {
            this.title = title;
            this.category = category;
            this.difficulty = difficulty;
            this.currentParticipants = currentParticipants;
            this.maxParticipants = maxParticipants;
        }

        public String getTitle() { return title; }
        public String getCategory() { return category; }
        public String getDifficulty() { return difficulty; }
        public int getCurrentParticipants() { return currentParticipants; }
        public int getMaxParticipants() { return maxParticipants; }
        public double getUtilizationRate() {
            return maxParticipants > 0 ? (double) currentParticipants / maxParticipants * 100 : 0;
        }
    }

    public static class PopularAchievementDto {
        private String name;
        private String description;
        private String rarity;
        private long earnedCount;
        private double completionRate;

        public PopularAchievementDto(String name, String description, String rarity, long earnedCount, double completionRate) {
            this.name = name;
            this.description = description;
            this.rarity = rarity;
            this.earnedCount = earnedCount;
            this.completionRate = completionRate;
        }

        public String getName() { return name; }
        public String getDescription() { return description; }
        public String getRarity() { return rarity; }
        public long getEarnedCount() { return earnedCount; }
        public double getCompletionRate() { return completionRate; }
    }

    public static class DailyEngagement {
        private java.time.LocalDate date;
        private long activeUsers;
        private long newUsers;
        private long activities;

        public DailyEngagement(java.time.LocalDate date, long activeUsers, long newUsers, long activities) {
            this.date = date;
            this.activeUsers = activeUsers;
            this.newUsers = newUsers;
            this.activities = activities;
        }

        public java.time.LocalDate getDate() { return date; }
        public long getActiveUsers() { return activeUsers; }
        public long getNewUsers() { return newUsers; }
        public long getActivities() { return activities; }
    }

    public static class SystemHealthDto {
        private String status;
        private double cpuUsage;
        private double memoryUsage;
        private double diskUsage;

        public SystemHealthDto(String status, double cpuUsage, double memoryUsage, double diskUsage) {
            this.status = status;
            this.cpuUsage = cpuUsage;
            this.memoryUsage = memoryUsage;
            this.diskUsage = diskUsage;
        }

        public String getStatus() { return status; }
        public double getCpuUsage() { return cpuUsage; }
        public double getMemoryUsage() { return memoryUsage; }
        public double getDiskUsage() { return diskUsage; }
    }
}