package com.voltx.service;

import com.voltx.dto.UserPreferencesDTO;
import com.voltx.entity.UserPreferences;
import com.voltx.entity.User;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.UserPreferencesRepository;
import com.voltx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for managing user preferences and settings
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;

    /**
     * Get user preferences
     */
    @Cacheable(value = "userPreferences", key = "#userId")
    public UserPreferencesDTO getUserPreferences(Long userId) {
        UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        return convertToDTO(preferences);
    }

    /**
     * Update user preferences
     */
    @Transactional
    @CacheEvict(value = "userPreferences", key = "#userId")
    public UserPreferencesDTO updateUserPreferences(Long userId, UserPreferencesDTO dto) {
        UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        // Update notification settings
        if (dto.getEmailNotifications() != null) {
            preferences.setEmailNotifications(dto.getEmailNotifications());
        }
        if (dto.getPushNotifications() != null) {
            preferences.setPushNotifications(dto.getPushNotifications());
        }
        if (dto.getSmsNotifications() != null) {
            preferences.setSmsNotifications(dto.getSmsNotifications());
        }

        // Update notification types
        if (dto.getNotifyOnFollow() != null) {
            preferences.setNotifyOnFollow(dto.getNotifyOnFollow());
        }
        if (dto.getNotifyOnLike() != null) {
            preferences.setNotifyOnLike(dto.getNotifyOnLike());
        }
        if (dto.getNotifyOnComment() != null) {
            preferences.setNotifyOnComment(dto.getNotifyOnComment());
        }
        if (dto.getNotifyOnAchievement() != null) {
            preferences.setNotifyOnAchievement(dto.getNotifyOnAchievement());
        }

        // Update privacy settings
        if (dto.getProfileVisibility() != null) {
            preferences.setProfileVisibility(dto.getProfileVisibility());
        }
        if (dto.getActivityVisibility() != null) {
            preferences.setActivityVisibility(dto.getActivityVisibility());
        }
        if (dto.getShowEmail() != null) {
            preferences.setShowEmail(dto.getShowEmail());
        }
        if (dto.getShowLocation() != null) {
            preferences.setShowLocation(dto.getShowLocation());
        }

        // Update display preferences
        if (dto.getTheme() != null) {
            preferences.setTheme(dto.getTheme());
        }
        if (dto.getLanguage() != null) {
            preferences.setLanguage(dto.getLanguage());
        }
        if (dto.getTimezone() != null) {
            preferences.setTimezone(dto.getTimezone());
        }
        if (dto.getDistanceUnit() != null) {
            preferences.setDistanceUnit(dto.getDistanceUnit());
        }

        // Update activity defaults
        if (dto.getDefaultActivityVisibility() != null) {
            preferences.setDefaultActivityVisibility(dto.getDefaultActivityVisibility());
        }
        if (dto.getAutoTrackLocation() != null) {
            preferences.setAutoTrackLocation(dto.getAutoTrackLocation());
        }

        preferences.setUpdatedAt(LocalDateTime.now());
        preferences = preferencesRepository.save(preferences);

        log.info("Updated preferences for user {}", userId);
        return convertToDTO(preferences);
    }

    /**
     * Update specific preference field
     */
    @Transactional
    @CacheEvict(value = "userPreferences", key = "#userId")
    public void updatePreferenceField(Long userId, String field, Object value) {
        UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        switch (field.toLowerCase()) {
            case "emailnotifications":
                preferences.setEmailNotifications((Boolean) value);
                break;
            case "pushnotifications":
                preferences.setPushNotifications((Boolean) value);
                break;
            case "smsnotifications":
                preferences.setSmsNotifications((Boolean) value);
                break;
            case "theme":
                preferences.setTheme((String) value);
                break;
            case "language":
                preferences.setLanguage((String) value);
                break;
            case "timezone":
                preferences.setTimezone((String) value);
                break;
            case "distanceunit":
                preferences.setDistanceUnit((String) value);
                break;
            case "profilevisibility":
                preferences.setProfileVisibility((String) value);
                break;
            case "activityvisibility":
                preferences.setActivityVisibility((String) value);
                break;
            default:
                throw new IllegalArgumentException("Unknown preference field: " + field);
        }

        preferences.setUpdatedAt(LocalDateTime.now());
        preferencesRepository.save(preferences);

        log.info("Updated preference field {} for user {}", field, userId);
    }

    /**
     * Reset preferences to default
     */
    @Transactional
    @CacheEvict(value = "userPreferences", key = "#userId")
    public UserPreferencesDTO resetToDefault(Long userId) {
        preferencesRepository.deleteByUserId(userId);
        UserPreferences preferences = createDefaultPreferences(userId);
        log.info("Reset preferences to default for user {}", userId);
        return convertToDTO(preferences);
    }

    /**
     * Get notification preferences summary
     */
    public Map<String, Boolean> getNotificationPreferences(Long userId) {
        UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        Map<String, Boolean> notificationPrefs = new HashMap<>();
        notificationPrefs.put("emailNotifications", preferences.isEmailNotifications());
        notificationPrefs.put("pushNotifications", preferences.isPushNotifications());
        notificationPrefs.put("smsNotifications", preferences.isSmsNotifications());
        notificationPrefs.put("notifyOnFollow", preferences.isNotifyOnFollow());
        notificationPrefs.put("notifyOnLike", preferences.isNotifyOnLike());
        notificationPrefs.put("notifyOnComment", preferences.isNotifyOnComment());
        notificationPrefs.put("notifyOnAchievement", preferences.isNotifyOnAchievement());

        return notificationPrefs;
    }

    /**
     * Get privacy preferences summary
     */
    public Map<String, Object> getPrivacyPreferences(Long userId) {
        UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        Map<String, Object> privacyPrefs = new HashMap<>();
        privacyPrefs.put("profileVisibility", preferences.getProfileVisibility());
        privacyPrefs.put("activityVisibility", preferences.getActivityVisibility());
        privacyPrefs.put("showEmail", preferences.isShowEmail());
        privacyPrefs.put("showLocation", preferences.isShowLocation());

        return privacyPrefs;
    }

    /**
     * Check if user should receive notification
     */
    public boolean shouldNotify(Long userId, String notificationType) {
        UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        // Check if notifications are enabled
        if (!preferences.isPushNotifications() && !preferences.isEmailNotifications()) {
            return false;
        }

        // Check specific notification type
        switch (notificationType.toUpperCase()) {
            case "FOLLOW":
                return preferences.isNotifyOnFollow();
            case "LIKE":
                return preferences.isNotifyOnLike();
            case "COMMENT":
                return preferences.isNotifyOnComment();
            case "ACHIEVEMENT":
                return preferences.isNotifyOnAchievement();
            default:
                return true; // Default to true for unknown types
        }
    }

    /**
     * Export user preferences
     */
    public Map<String, Object> exportPreferences(Long userId) {
        UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        Map<String, Object> export = new HashMap<>();
        export.put("notifications", getNotificationPreferences(userId));
        export.put("privacy", getPrivacyPreferences(userId));
        export.put("display", Map.of(
                "theme", preferences.getTheme(),
                "language", preferences.getLanguage(),
                "timezone", preferences.getTimezone(),
                "distanceUnit", preferences.getDistanceUnit()
        ));
        export.put("activity", Map.of(
                "defaultVisibility", preferences.getDefaultActivityVisibility(),
                "autoTrackLocation", preferences.isAutoTrackLocation()
        ));

        return export;
    }

    /**
     * Create default preferences for new user
     */
    @Transactional
    public UserPreferences createDefaultPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserPreferences preferences = UserPreferences.builder()
                .user(user)
                // Notification settings - defaults to true
                .emailNotifications(true)
                .pushNotifications(true)
                .smsNotifications(false)
                .notifyOnFollow(true)
                .notifyOnLike(true)
                .notifyOnComment(true)
                .notifyOnAchievement(true)
                // Privacy settings - defaults to public
                .profileVisibility("public")
                .activityVisibility("public")
                .showEmail(false)
                .showLocation(true)
                // Display settings - defaults
                .theme("light")
                .language("en")
                .timezone("UTC")
                .distanceUnit("km")
                // Activity defaults
                .defaultActivityVisibility("public")
                .autoTrackLocation(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return preferencesRepository.save(preferences);
    }

    /**
     * Convert entity to DTO
     */
    private UserPreferencesDTO convertToDTO(UserPreferences preferences) {
        return UserPreferencesDTO.builder()
                .id(preferences.getId())
                .userId(preferences.getUser().getId())
                // Notification settings
                .emailNotifications(preferences.isEmailNotifications())
                .pushNotifications(preferences.isPushNotifications())
                .smsNotifications(preferences.isSmsNotifications())
                .notifyOnFollow(preferences.isNotifyOnFollow())
                .notifyOnLike(preferences.isNotifyOnLike())
                .notifyOnComment(preferences.isNotifyOnComment())
                .notifyOnAchievement(preferences.isNotifyOnAchievement())
                // Privacy settings
                .profileVisibility(preferences.getProfileVisibility())
                .activityVisibility(preferences.getActivityVisibility())
                .showEmail(preferences.isShowEmail())
                .showLocation(preferences.isShowLocation())
                // Display settings
                .theme(preferences.getTheme())
                .language(preferences.getLanguage())
                .timezone(preferences.getTimezone())
                .distanceUnit(preferences.getDistanceUnit())
                // Activity defaults
                .defaultActivityVisibility(preferences.getDefaultActivityVisibility())
                .autoTrackLocation(preferences.isAutoTrackLocation())
                .createdAt(preferences.getCreatedAt())
                .updatedAt(preferences.getUpdatedAt())
                .build();
    }
}
