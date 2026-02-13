package com.voltx.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Junction entity representing a user's unlocked achievement
 */
@Entity
@Table(name = "user_achievements",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "achievement_id"}),
       indexes = {
           @Index(name = "idx_user_achievement_user", columnList = "user_id"),
           @Index(name = "idx_user_achievement_achievement", columnList = "achievement_id"),
           @Index(name = "idx_user_achievement_unlocked", columnList = "unlockedAt")
       })
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achievement_id", nullable = false)
    @NotNull(message = "Achievement is required")
    private Achievement achievement;

    @Column(nullable = false)
    @NotNull(message = "Points earned is required")
    private Integer pointsEarned;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime unlockedAt;

    @Column
    private Double progressPercentage = 0.0;

    @Column(length = 500)
    private String unlockNote;

    @Column
    private Boolean notified = false;

    // Constructors
    public UserAchievement() {}

    public UserAchievement(User user, Achievement achievement, Integer pointsEarned) {
        this.user = user;
        this.achievement = achievement;
        this.pointsEarned = pointsEarned;
    }

    public UserAchievement(User user, Achievement achievement, Integer pointsEarned, String unlockNote) {
        this.user = user;
        this.achievement = achievement;
        this.pointsEarned = pointsEarned;
        this.unlockNote = unlockNote;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Achievement getAchievement() { return achievement; }
    public void setAchievement(Achievement achievement) { this.achievement = achievement; }

    public Integer getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }

    public LocalDateTime getUnlockedAt() { return unlockedAt; }
    public void setUnlockedAt(LocalDateTime unlockedAt) { this.unlockedAt = unlockedAt; }

    public Double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getUnlockNote() { return unlockNote; }
    public void setUnlockNote(String unlockNote) { this.unlockNote = unlockNote; }

    public Boolean getNotified() { return notified; }
    public void setNotified(Boolean notified) { this.notified = notified; }

    @Override
    public String toString() {
        return "UserAchievement{" +
                "id=" + id +
                ", user=" + (user != null ? user.getUsername() : "null") +
                ", achievement=" + (achievement != null ? achievement.getName() : "null") +
                ", pointsEarned=" + pointsEarned +
                ", unlockedAt=" + unlockedAt +
                '}';
    }
}
