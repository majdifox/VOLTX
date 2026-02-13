package com.voltx.entity;

import com.voltx.enums.AchievementCategory;
import com.voltx.enums.AchievementRarity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Achievement entity representing unlockable achievements in the VoltX platform
 */
@Entity
@Table(name = "achievements", indexes = {
    @Index(name = "idx_achievement_category", columnList = "category"),
    @Index(name = "idx_achievement_rarity", columnList = "rarity"),
    @Index(name = "idx_achievement_active", columnList = "active")
})
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    @NotBlank(message = "Achievement key is required")
    @Size(max = 100, message = "Achievement key must not exceed 100 characters")
    private String achievementKey;

    @Column(nullable = false, length = 200)
    @NotBlank(message = "Achievement name is required")
    @Size(max = 200, message = "Achievement name must not exceed 200 characters")
    private String name;

    @Column(length = 500)
    @Size(max = 500, message = "Achievement description must not exceed 500 characters")
    private String description;

    @Column(length = 1000)
    @Size(max = 1000, message = "Achievement criteria must not exceed 1000 characters")
    private String unlockCriteria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @NotNull(message = "Achievement category is required")
    private AchievementCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @NotNull(message = "Achievement rarity is required")
    private AchievementRarity rarity;

    @Column(nullable = false)
    @NotNull(message = "Achievement points value is required")
    private Integer pointsReward = 0;

    @Column(length = 20)
    @Size(max = 20, message = "Achievement icon must not exceed 20 characters")
    private String icon;

    @Column(length = 50)
    @Size(max = 50, message = "Achievement color must not exceed 50 characters")
    private String color;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean hidden = false;

    @Column
    private Integer sortOrder = 0;

    // Requirements for unlocking
    @Column
    private Integer requiredLevel;

    @Column
    private Integer requiredPoints;

    @Column
    private Integer requiredLogins;

    // JSON field for complex requirements
    @Column(columnDefinition = "TEXT")
    private String requirementsJson;

    @OneToMany(mappedBy = "achievement", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<UserAchievement> userAchievements;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Achievement() {}

    public Achievement(String achievementKey, String name, String description,
                      AchievementCategory category, AchievementRarity rarity, Integer pointsReward) {
        this.achievementKey = achievementKey;
        this.name = name;
        this.description = description;
        this.category = category;
        this.rarity = rarity;
        this.pointsReward = pointsReward;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAchievementKey() { return achievementKey; }
    public void setAchievementKey(String achievementKey) { this.achievementKey = achievementKey; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUnlockCriteria() { return unlockCriteria; }
    public void setUnlockCriteria(String unlockCriteria) { this.unlockCriteria = unlockCriteria; }

    public AchievementCategory getCategory() { return category; }
    public void setCategory(AchievementCategory category) { this.category = category; }

    public AchievementRarity getRarity() { return rarity; }
    public void setRarity(AchievementRarity rarity) { this.rarity = rarity; }

    public Integer getPointsReward() { return pointsReward; }
    public void setPointsReward(Integer pointsReward) { this.pointsReward = pointsReward; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Boolean getHidden() { return hidden; }
    public void setHidden(Boolean hidden) { this.hidden = hidden; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Integer getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }

    public Integer getRequiredPoints() { return requiredPoints; }
    public void setRequiredPoints(Integer requiredPoints) { this.requiredPoints = requiredPoints; }

    public Integer getRequiredLogins() { return requiredLogins; }
    public void setRequiredLogins(Integer requiredLogins) { this.requiredLogins = requiredLogins; }

    public String getRequirementsJson() { return requirementsJson; }
    public void setRequirementsJson(String requirementsJson) { this.requirementsJson = requirementsJson; }

    public Set<UserAchievement> getUserAchievements() { return userAchievements; }
    public void setUserAchievements(Set<UserAchievement> userAchievements) { this.userAchievements = userAchievements; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "Achievement{" +
                "id=" + id +
                ", achievementKey='" + achievementKey + '\'' +
                ", name='" + name + '\'' +
                ", category=" + category +
                ", rarity=" + rarity +
                ", pointsReward=" + pointsReward +
                '}';
    }
}
