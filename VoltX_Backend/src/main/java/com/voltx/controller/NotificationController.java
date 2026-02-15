package com.voltx.controller;

import com.voltx.dto.NotificationResponse;
import com.voltx.dto.NotificationStats;
import com.voltx.entity.User;
import com.voltx.enums.NotificationType;
import com.voltx.service.NotificationService;
import com.voltx.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    /**
     * Get paginated notifications for current user
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getCurrentUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get all notifications (legacy endpoint)
     */
    @GetMapping("/all")
    public ResponseEntity<List<NotificationResponse>> getAllNotifications(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    /**
     * Get unread notifications only
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    /**
     * Get notification statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<NotificationStats> getStats(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(notificationService.getUserNotificationStats(userId));
    }

    /**
     * Mark specific notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    /**
     * Delete specific notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        notificationService.deleteNotification(userId, id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    /**
     * Broadcast notification to all users (admin only)
     */
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> broadcastNotification(
            @RequestBody Map<String, String> request) {
        NotificationType type = NotificationType.valueOf(
                request.getOrDefault("type", "SYSTEM_ANNOUNCEMENT"));
        String message = request.get("message");

        if (message == null || message.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Message is required"));
        }

        notificationService.broadcastNotification(type, message);
        log.info("Broadcasting notification: {}", message);
        return ResponseEntity.ok(Map.of("message", "Notification broadcast initiated"));
    }

    /**
     * Clean up old notifications (admin only)
     */
    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> cleanupNotifications(
            @RequestParam(defaultValue = "30") int daysOld) {
        int deletedCount = notificationService.deleteOldReadNotifications(daysOld);
        log.info("Cleaned up {} old notifications", deletedCount);
        return ResponseEntity.ok(Map.of(
                "message", "Cleanup completed",
                "deletedCount", deletedCount
        ));
    }

    private Long getCurrentUserId(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user.getId();
    }
}
