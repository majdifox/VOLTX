package com.voltx.controller;

import com.voltx.dto.ApiResponse;
import com.voltx.service.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final LevelService levelService;

    @GetMapping("/levels")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllLevels() {
        // Return all level information for the frontend
        Map<String, Object> levelData = Map.of(
            "maxLevel", 15,
            "levels", Map.of(
                "1", Map.of("threshold", 0, "title", "Novice Explorer"),
                "2", Map.of("threshold", 100, "title", "Thrill Seeker"),
                "3", Map.of("threshold", 250, "title", "Risk Taker"),
                "4", Map.of("threshold", 500, "title", "Adrenaline Junkie"),
                "5", Map.of("threshold", 1000, "title", "Extreme Athlete"),
                "6", Map.of("threshold", 2000, "title", "Danger Zone"),
                "7", Map.of("threshold", 3500, "title", "Fear Eliminator"),
                "8", Map.of("threshold", 5500, "title", "Action Hero"),
                "9", Map.of("threshold", 8000, "title", "Stunt Master"),
                "10", Map.of("threshold", 11000, "title", "Daredevil Legend"),
                "11", Map.of("threshold", 15000, "title", "Extreme Warrior"),
                "12", Map.of("threshold", 20000, "title", "Adrenaline God"),
                "13", Map.of("threshold", 26000, "title", "Ultimate Challenger"),
                "14", Map.of("threshold", 33000, "title", "Fearless Champion"),
                "15", Map.of("threshold", 41000, "title", "VoltX Master")
            )
        );

        return ResponseEntity.ok(ApiResponse.success("Level information retrieved successfully", levelData));
    }

    @GetMapping("/level/{points}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateLevel(@PathVariable int points) {
        Map<String, Object> levelInfo = levelService.getLevelInfo(points);
        return ResponseEntity.ok(ApiResponse.success("Level calculated successfully", levelInfo));
    }

    @GetMapping("/progress/{points}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLevelProgress(@PathVariable int points) {
        int level = levelService.calculateLevel(points);
        double progress = levelService.getLevelProgress(points, level);
        int pointsToNext = levelService.getPointsToNextLevel(points, level);

        Map<String, Object> progressInfo = Map.of(
            "currentLevel", level,
            "currentPoints", points,
            "progress", progress,
            "pointsToNext", pointsToNext,
            "isMaxLevel", levelService.isMaxLevel(level)
        );

        return ResponseEntity.ok(ApiResponse.success("Progress calculated successfully", progressInfo));
    }

    @PostMapping("/award-points")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CAPTAIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> awardPoints(
            @RequestParam Long userId,
            @RequestParam int points,
            @RequestParam(required = false) String reason) {

        // Validate points
        if (points <= 0 || points > 1000) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Points must be between 1 and 1000"));
        }

        // In a real implementation, this would integrate with UserService
        Map<String, Object> result = Map.of(
            "userId", userId,
            "pointsAwarded", points,
            "reason", reason != null ? reason : "Points awarded by administrator",
            "timestamp", java.time.Instant.now().toString()
        );

        return ResponseEntity.ok(ApiResponse.success("Points awarded successfully", result));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {

        if (limit > 100) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Limit cannot exceed 100"));
        }

        // Mock leaderboard data (in real implementation, fetch from database)
        Map<String, Object> leaderboard = Map.of(
            "topUsers", java.util.List.of(
                Map.of("username", "extremeRider", "level", 12, "points", 23500),
                Map.of("username", "skyDiver99", "level", 11, "points", 18750),
                Map.of("username", "mountainClimber", "level", 10, "points", 15200),
                Map.of("username", "adrenalineJunkie", "level", 9, "points", 12300),
                Map.of("username", "thillSeeker", "level", 8, "points", 9800)
            ),
            "limit", limit,
            "timestamp", java.time.Instant.now().toString()
        );

        return ResponseEntity.ok(ApiResponse.success("Leaderboard retrieved successfully", leaderboard));
    }

    @GetMapping("/achievements")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAchievements() {
        // Mock achievements system
        Map<String, Object> achievements = Map.of(
            "categories", java.util.List.of(
                Map.of(
                    "name", "Level Milestones",
                    "description", "Achievements for reaching new levels",
                    "badges", java.util.List.of(
                        Map.of("name", "First Steps", "requirement", "Reach Level 2", "points", 50),
                        Map.of("name", "Getting Started", "requirement", "Reach Level 5", "points", 100),
                        Map.of("name", "Seasoned Explorer", "requirement", "Reach Level 10", "points", 250),
                        Map.of("name", "Elite Adventurer", "requirement", "Reach Level 15", "points", 500)
                    )
                ),
                Map.of(
                    "name", "Activity Achievements",
                    "description", "Achievements for completing activities",
                    "badges", java.util.List.of(
                        Map.of("name", "First Event", "requirement", "Complete your first event", "points", 25),
                        Map.of("name", "Event Enthusiast", "requirement", "Complete 10 events", "points", 100),
                        Map.of("name", "Event Master", "requirement", "Complete 50 events", "points", 300)
                    )
                )
            )
        );

        return ResponseEntity.ok(ApiResponse.success("Achievements retrieved successfully", achievements));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGamificationStatistics() {
        // Mock statistics for admin dashboard
        Map<String, Object> statistics = Map.of(
            "totalUsers", 1250,
            "averageLevel", 4.2,
            "totalPointsAwarded", 1500000,
            "levelDistribution", Map.of(
                "1-3", 45,  // percentage
                "4-6", 30,
                "7-9", 15,
                "10-12", 8,
                "13-15", 2
            ),
            "mostActiveLevel", 5,
            "pointsAwardedToday", 12500,
            "newUsersThisWeek", 89
        );

        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", statistics));
    }
}