package com.voltx.controller;

import com.voltx.dto.UserPreferencesDTO;
import com.voltx.entity.User;
import com.voltx.service.UserPreferencesService;
import com.voltx.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for user preferences management
 */
@Slf4j
@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;
    private final UserService userService;

    /**
     * Get current user's preferences
     */
    @GetMapping
    public ResponseEntity<UserPreferencesDTO> getPreferences(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        UserPreferencesDTO preferences = preferencesService.getUserPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    /**
     * Update current user's preferences
     */
    @PutMapping
    public ResponseEntity<UserPreferencesDTO> updatePreferences(
            @RequestBody UserPreferencesDTO dto,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);

        try {
            UserPreferencesDTO updated = preferencesService.updateUserPreferences(userId, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Failed to update preferences for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update specific preference field
     */
    @PatchMapping("/{field}")
    public ResponseEntity<Map<String, String>> updatePreferenceField(
            @PathVariable String field,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);

        try {
            Object value = body.get("value");
            if (value == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Value is required"));
            }

            preferencesService.updatePreferenceField(userId, field, value);
            return ResponseEntity.ok(Map.of("message", "Preference updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update preference field {}: {}", field, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update preference"));
        }
    }

    /**
     * Reset preferences to default
     */
    @PostMapping("/reset")
    public ResponseEntity<UserPreferencesDTO> resetToDefault(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        UserPreferencesDTO preferences = preferencesService.resetToDefault(userId);
        return ResponseEntity.ok(preferences);
    }

    /**
     * Get notification preferences
     */
    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Boolean>> getNotificationPreferences(
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Map<String, Boolean> preferences = preferencesService.getNotificationPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    /**
     * Get privacy preferences
     */
    @GetMapping("/privacy")
    public ResponseEntity<Map<String, Object>> getPrivacyPreferences(
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Map<String, Object> preferences = preferencesService.getPrivacyPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    /**
     * Export all preferences
     */
    @GetMapping("/export")
    public ResponseEntity<Map<String, Object>> exportPreferences(
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Map<String, Object> export = preferencesService.exportPreferences(userId);
        return ResponseEntity.ok(export);
    }

    /**
     * Update notification preferences
     */
    @PutMapping("/notifications")
    public ResponseEntity<Map<String, String>> updateNotificationPreferences(
            @RequestBody Map<String, Boolean> notifications,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);

        try {
            UserPreferencesDTO dto = preferencesService.getUserPreferences(userId);

            // Update notification settings from request
            if (notifications.containsKey("emailNotifications")) {
                dto.setEmailNotifications(notifications.get("emailNotifications"));
            }
            if (notifications.containsKey("pushNotifications")) {
                dto.setPushNotifications(notifications.get("pushNotifications"));
            }
            if (notifications.containsKey("smsNotifications")) {
                dto.setSmsNotifications(notifications.get("smsNotifications"));
            }
            if (notifications.containsKey("notifyOnFollow")) {
                dto.setNotifyOnFollow(notifications.get("notifyOnFollow"));
            }
            if (notifications.containsKey("notifyOnLike")) {
                dto.setNotifyOnLike(notifications.get("notifyOnLike"));
            }
            if (notifications.containsKey("notifyOnComment")) {
                dto.setNotifyOnComment(notifications.get("notifyOnComment"));
            }
            if (notifications.containsKey("notifyOnAchievement")) {
                dto.setNotifyOnAchievement(notifications.get("notifyOnAchievement"));
            }

            preferencesService.updateUserPreferences(userId, dto);
            return ResponseEntity.ok(Map.of("message", "Notification preferences updated"));
        } catch (Exception e) {
            log.error("Failed to update notification preferences: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update preferences"));
        }
    }

    /**
     * Update privacy preferences
     */
    @PutMapping("/privacy")
    public ResponseEntity<Map<String, String>> updatePrivacyPreferences(
            @RequestBody Map<String, Object> privacy,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);

        try {
            UserPreferencesDTO dto = preferencesService.getUserPreferences(userId);

            // Update privacy settings from request
            if (privacy.containsKey("profileVisibility")) {
                dto.setProfileVisibility((String) privacy.get("profileVisibility"));
            }
            if (privacy.containsKey("activityVisibility")) {
                dto.setActivityVisibility((String) privacy.get("activityVisibility"));
            }
            if (privacy.containsKey("showEmail")) {
                dto.setShowEmail((Boolean) privacy.get("showEmail"));
            }
            if (privacy.containsKey("showLocation")) {
                dto.setShowLocation((Boolean) privacy.get("showLocation"));
            }

            preferencesService.updateUserPreferences(userId, dto);
            return ResponseEntity.ok(Map.of("message", "Privacy preferences updated"));
        } catch (Exception e) {
            log.error("Failed to update privacy preferences: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update preferences"));
        }
    }

    /**
     * Update display preferences (theme, language, etc.)
     */
    @PutMapping("/display")
    public ResponseEntity<Map<String, String>> updateDisplayPreferences(
            @RequestBody Map<String, String> display,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);

        try {
            UserPreferencesDTO dto = preferencesService.getUserPreferences(userId);

            // Update display settings from request
            if (display.containsKey("theme")) {
                dto.setTheme(display.get("theme"));
            }
            if (display.containsKey("language")) {
                dto.setLanguage(display.get("language"));
            }
            if (display.containsKey("timezone")) {
                dto.setTimezone(display.get("timezone"));
            }
            if (display.containsKey("distanceUnit")) {
                dto.setDistanceUnit(display.get("distanceUnit"));
            }

            preferencesService.updateUserPreferences(userId, dto);
            return ResponseEntity.ok(Map.of("message", "Display preferences updated"));
        } catch (Exception e) {
            log.error("Failed to update display preferences: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update preferences"));
        }
    }

    private Long getCurrentUserId(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user.getId();
    }
}
