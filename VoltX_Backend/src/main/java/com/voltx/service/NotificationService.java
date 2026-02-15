package com.voltx.service;

import com.voltx.dto.NotificationResponse;
import com.voltx.dto.NotificationStats;
import com.voltx.entity.Notification;
import com.voltx.entity.User;
import com.voltx.enums.NotificationType;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.NotificationRepository;
import com.voltx.repository.UserRepository;
import com.voltx.websocket.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final WebSocketEventPublisher webSocketEventPublisher;

    /**
     * Create and send a notification to a user (async)
     */
    @Async
    @Transactional
    @CacheEvict(value = {"userNotifications", "unreadCount"}, key = "#recipient.id")
    public void createNotification(User recipient, NotificationType type,
            String message, Long referenceId) {
        try {
            Notification notification = Notification.builder()
                    .recipient(recipient)
                    .type(type)
                    .message(message)
                    .referenceId(referenceId)
                    .read(false)
                    .build();
            notification = notificationRepository.save(notification);
            log.info("Created notification {} for user {}", notification.getId(), recipient.getId());

            // Push notification via WebSocket for real-time delivery
            NotificationResponse response = toResponse(notification);
            webSocketEventPublisher.sendNotification(recipient.getId(), response);
        } catch (Exception e) {
            log.error("Failed to create notification for user {}: {}", recipient.getId(), e.getMessage());
        }
    }

    /**
     * Get user notifications with pagination
     */
    @Cacheable(value = "userNotifications", key = "#userId + '-' + #pageable.pageNumber")
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
            .findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(this::toResponse);
    }

    /**
     * Get all user notifications (legacy)
     */
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notifications
     */
    @Cacheable(value = "unreadNotifications", key = "#userId")
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findByRecipientIdAndReadFalse(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Mark notification as read
     */
    @Transactional
    @CacheEvict(value = {"userNotifications", "unreadCount", "unreadNotifications"}, key = "#userId")
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access to notification");
        }

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
        log.debug("Marked notification {} as read for user {}", notificationId, userId);
    }

    /**
     * Mark notification as read (legacy)
     */
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for user
     */
    @Transactional
    @CacheEvict(value = {"userNotifications", "unreadCount", "unreadNotifications"}, key = "#userId")
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByRecipientIdAndReadFalse(userId);

        LocalDateTime now = LocalDateTime.now();
        unreadNotifications.forEach(n -> {
            n.setRead(true);
            n.setReadAt(now);
        });

        notificationRepository.saveAll(unreadNotifications);
        log.info("Marked {} notifications as read for user {}", unreadNotifications.size(), userId);
    }

    /**
     * Delete notification
     */
    @Transactional
    @CacheEvict(value = {"userNotifications", "unreadCount", "unreadNotifications"}, key = "#userId")
    public void deleteNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access to notification");
        }

        notificationRepository.delete(notification);
        log.debug("Deleted notification {} for user {}", notificationId, userId);
    }

    /**
     * Delete old read notifications (cleanup job)
     */
    @Transactional
    @CacheEvict(value = {"userNotifications", "unreadCount"}, allEntries = true)
    public int deleteOldReadNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<Notification> oldNotifications = notificationRepository
            .findByReadTrueAndReadAtBefore(cutoffDate);

        if (!oldNotifications.isEmpty()) {
            notificationRepository.deleteAll(oldNotifications);
            log.info("Deleted {} old read notifications", oldNotifications.size());
            return oldNotifications.size();
        }
        return 0;
    }

    /**
     * Get unread notification count
     */
    @Cacheable(value = "unreadCount", key = "#userId")
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    /**
     * Get notification statistics for user
     */
    public NotificationStats getUserNotificationStats(Long userId) {
        long totalCount = notificationRepository.countByRecipientId(userId);
        long unreadCount = notificationRepository.countByRecipientIdAndReadFalse(userId);
        long readCount = totalCount - unreadCount;

        Map<NotificationType, Long> countsByType = notificationRepository
                .findByRecipientId(userId)
                .stream()
                .collect(Collectors.groupingBy(Notification::getType, Collectors.counting()));

        return NotificationStats.builder()
                .totalCount(totalCount)
                .readCount(readCount)
                .unreadCount(unreadCount)
                .countsByType(countsByType)
                .build();
    }

    // Notification creation helpers for common events

    @Async
    public void notifyNewFollower(User recipient, User follower) {
        createNotification(
                recipient,
                NotificationType.NEW_FOLLOWER,
                follower.getUsername() + " started following you",
                follower.getId()
        );
    }

    @Async
    public void notifyActivityLike(User recipient, User liker, Long activityId, String activityTitle) {
        createNotification(
                recipient,
                NotificationType.ACTIVITY_LIKE,
                liker.getUsername() + " liked your activity: " + activityTitle,
                activityId
        );
    }

    @Async
    public void notifyActivityComment(User recipient, User commenter, Long activityId, String activityTitle) {
        createNotification(
                recipient,
                NotificationType.ACTIVITY_COMMENT,
                commenter.getUsername() + " commented on your activity: " + activityTitle,
                activityId
        );
    }

    @Async
    public void notifyAchievementUnlocked(User recipient, Long achievementId, String achievementName) {
        createNotification(
                recipient,
                NotificationType.ACHIEVEMENT_UNLOCKED,
                "You unlocked the achievement: " + achievementName,
                achievementId
        );
    }

    @Async
    public void notifyLevelUp(User recipient, int newLevel) {
        createNotification(
                recipient,
                NotificationType.LEVEL_UP,
                "Congratulations! You reached level " + newLevel,
                (long) newLevel
        );
    }

    @Async
    public void notifyEventReminder(User recipient, Long eventId, String eventName) {
        createNotification(
                recipient,
                NotificationType.EVENT_REMINDER,
                "Upcoming event: " + eventName,
                eventId
        );
    }

    @Async
    public void notifySystemAnnouncement(User recipient, String message) {
        createNotification(
                recipient,
                NotificationType.SYSTEM_ANNOUNCEMENT,
                message,
                null
        );
    }

    /**
     * Broadcast notification to all users
     */
    @Async
    @Transactional
    public void broadcastNotification(NotificationType type, String message) {
        List<User> allUsers = userRepository.findAll();
        log.info("Broadcasting notification to {} users", allUsers.size());

        allUsers.forEach(user -> createNotification(user, type, message, null));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .message(n.getMessage())
                .referenceId(n.getReferenceId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt().toString())
                .readAt(n.getReadAt() != null ? n.getReadAt().toString() : null)
                .build();
    }
}
