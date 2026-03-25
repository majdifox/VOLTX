package com.voltx.controller;

import com.voltx.dto.ApiResponse;
import com.voltx.service.AnalyticsService;
import com.voltx.service.AnalyticsService.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for analytics and reporting
 */
@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Platform analytics and reporting")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Get platform overview metrics
     */
    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Get platform overview", description = "Get comprehensive platform overview metrics")
    public ResponseEntity<ApiResponse<PlatformOverview>> getPlatformOverview() {
        PlatformOverview overview = analyticsService.getPlatformOverview();
        return ResponseEntity.ok(ApiResponse.success("Platform overview retrieved successfully", overview));
    }

    /**
     * Get user analytics
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Get user analytics", description = "Get detailed user analytics and statistics")
    public ResponseEntity<ApiResponse<UserAnalytics>> getUserAnalytics() {
        UserAnalytics userAnalytics = analyticsService.getUserAnalytics();
        return ResponseEntity.ok(ApiResponse.success("User analytics retrieved successfully", userAnalytics));
    }

    /**
     * Get activity analytics
     */
    @GetMapping("/activities")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Get activity analytics", description = "Get detailed activity analytics and statistics")
    public ResponseEntity<ApiResponse<ActivityAnalytics>> getActivityAnalytics() {
        ActivityAnalytics activityAnalytics = analyticsService.getActivityAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Activity analytics retrieved successfully", activityAnalytics));
    }

    /**
     * Get achievement analytics
     */
    @GetMapping("/achievements")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Get achievement analytics", description = "Get detailed achievement analytics and statistics")
    public ResponseEntity<ApiResponse<AchievementAnalytics>> getAchievementAnalytics() {
        AchievementAnalytics achievementAnalytics = analyticsService.getAchievementAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Achievement analytics retrieved successfully", achievementAnalytics));
    }

    /**
     * Get engagement metrics
     */
    @GetMapping("/engagement")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Get engagement metrics", description = "Get user engagement and retention metrics")
    public ResponseEntity<ApiResponse<EngagementMetrics>> getEngagementMetrics() {
        EngagementMetrics engagementMetrics = analyticsService.getEngagementMetrics();
        return ResponseEntity.ok(ApiResponse.success("Engagement metrics retrieved successfully", engagementMetrics));
    }

    /**
     * Get real-time metrics
     */
    @GetMapping("/realtime")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Get real-time metrics", description = "Get real-time platform metrics and system health")
    public ResponseEntity<ApiResponse<RealTimeMetrics>> getRealTimeMetrics() {
        RealTimeMetrics realTimeMetrics = analyticsService.getRealTimeMetrics();
        return ResponseEntity.ok(ApiResponse.success("Real-time metrics retrieved successfully", realTimeMetrics));
    }

    /**
     * Get comprehensive dashboard data
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Get dashboard data", description = "Get all analytics data for admin dashboard")
    public ResponseEntity<ApiResponse<DashboardData>> getDashboardData() {
        DashboardData dashboardData = new DashboardData();

        // Gather all analytics data
        dashboardData.setOverview(analyticsService.getPlatformOverview());
        dashboardData.setUserAnalytics(analyticsService.getUserAnalytics());
        dashboardData.setActivityAnalytics(analyticsService.getActivityAnalytics());
        dashboardData.setAchievementAnalytics(analyticsService.getAchievementAnalytics());
        dashboardData.setEngagementMetrics(analyticsService.getEngagementMetrics());
        dashboardData.setRealTimeMetrics(analyticsService.getRealTimeMetrics());

        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", dashboardData));
    }

    /**
     * Comprehensive dashboard data DTO
     */
    public static class DashboardData {
        private PlatformOverview overview;
        private UserAnalytics userAnalytics;
        private ActivityAnalytics activityAnalytics;
        private AchievementAnalytics achievementAnalytics;
        private EngagementMetrics engagementMetrics;
        private RealTimeMetrics realTimeMetrics;

        // Getters and Setters
        public PlatformOverview getOverview() { return overview; }
        public void setOverview(PlatformOverview overview) { this.overview = overview; }

        public UserAnalytics getUserAnalytics() { return userAnalytics; }
        public void setUserAnalytics(UserAnalytics userAnalytics) { this.userAnalytics = userAnalytics; }

        public ActivityAnalytics getActivityAnalytics() { return activityAnalytics; }
        public void setActivityAnalytics(ActivityAnalytics activityAnalytics) { this.activityAnalytics = activityAnalytics; }

        public AchievementAnalytics getAchievementAnalytics() { return achievementAnalytics; }
        public void setAchievementAnalytics(AchievementAnalytics achievementAnalytics) { this.achievementAnalytics = achievementAnalytics; }

        public EngagementMetrics getEngagementMetrics() { return engagementMetrics; }
        public void setEngagementMetrics(EngagementMetrics engagementMetrics) { this.engagementMetrics = engagementMetrics; }

        public RealTimeMetrics getRealTimeMetrics() { return realTimeMetrics; }
        public void setRealTimeMetrics(RealTimeMetrics realTimeMetrics) { this.realTimeMetrics = realTimeMetrics; }
    }
}