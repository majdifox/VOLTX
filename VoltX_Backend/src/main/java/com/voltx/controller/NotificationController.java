package com.voltx.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * WebSocket controller for real-time notifications and messaging
 * Handles live updates for gamification, leaderboards, and system notifications
 */
@Controller
public class NotificationController {

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    /**
     * Handle user connection and send welcome message
     */
    @MessageMapping("/connect")
    @SendToUser("/queue/notifications")
    public Map<String, Object> handleUserConnect(Authentication authentication) {
        String username = authentication.getName();

        return Map.of(
            "type", "WELCOME",
            "message", "Connected to VoltX real-time updates",
            "username", username,
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }

    /**
     * Handle level up notifications
     */
    @MessageMapping("/levelup")
    @SendTo("/topic/leaderboard")
    public Map<String, Object> handleLevelUp(Map<String, Object> levelUpData, Authentication authentication) {
        String username = authentication.getName();

        return Map.of(
            "type", "LEVEL_UP",
            "username", username,
            "newLevel", levelUpData.get("level"),
            "adrenalinePoints", levelUpData.get("points"),
            "message", username + " reached Level " + levelUpData.get("level") + "!",
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }

    /**
     * Handle achievement unlocks
     */
    @MessageMapping("/achievement")
    @SendToUser("/queue/notifications")
    public Map<String, Object> handleAchievement(Map<String, Object> achievementData, Authentication authentication) {
        String username = authentication.getName();

        return Map.of(
            "type", "ACHIEVEMENT_UNLOCKED",
            "username", username,
            "achievement", achievementData.get("name"),
            "description", achievementData.get("description"),
            "points", achievementData.get("points"),
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }

    /**
     * Handle points earned notifications
     */
    @MessageMapping("/points")
    @SendToUser("/queue/notifications")
    public Map<String, Object> handlePointsEarned(Map<String, Object> pointsData, Authentication authentication) {
        String username = authentication.getName();

        return Map.of(
            "type", "POINTS_EARNED",
            "username", username,
            "points", pointsData.get("points"),
            "source", pointsData.get("source"),
            "totalPoints", pointsData.get("totalPoints"),
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }

    /**
     * Broadcast system announcements to all users
     */
    public void sendSystemAnnouncement(String message, String type) {
        Map<String, Object> announcement = Map.of(
            "type", "SYSTEM_ANNOUNCEMENT",
            "message", message,
            "announcementType", type,
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );

        messagingTemplate.convertAndSend("/topic/announcements", announcement);
    }

    /**
     * Send leaderboard updates to all subscribers
     */
    public void sendLeaderboardUpdate(Object leaderboardData) {
        Map<String, Object> update = Map.of(
            "type", "LEADERBOARD_UPDATE",
            "data", leaderboardData,
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );

        messagingTemplate.convertAndSend("/topic/leaderboard", update);
    }

    /**
     * Send personal notification to specific user
     */
    public void sendPersonalNotification(String username, String message, String type) {
        Map<String, Object> notification = Map.of(
            "type", type,
            "message", message,
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );

        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", notification);
    }

    /**
     * Handle activity status updates (online/offline)
     */
    @MessageMapping("/status")
    @SendTo("/topic/activity")
    public Map<String, Object> handleStatusUpdate(Map<String, Object> statusData, Authentication authentication) {
        String username = authentication.getName();

        return Map.of(
            "type", "STATUS_UPDATE",
            "username", username,
            "status", statusData.get("status"),
            "lastSeen", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }
}
