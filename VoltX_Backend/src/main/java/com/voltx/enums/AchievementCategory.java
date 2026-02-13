package com.voltx.enums;

/**
 * Categories for achievements in the VoltX platform
 */
public enum AchievementCategory {
    PROGRESSION("Progression", "Level up and general progress achievements"),
    SOCIAL("Social", "Community and interaction achievements"),
    SKILLS("Skills", "Skill-based and expertise achievements"),
    EXPLORATION("Exploration", "Discovery and adventure achievements"),
    DEDICATION("Dedication", "Commitment and loyalty achievements"),
    COMPETITION("Competition", "Competitive and leaderboard achievements"),
    SPECIAL("Special", "Limited time and special event achievements"),
    MILESTONE("Milestone", "Major milestone and anniversary achievements"),
    COLLECTION("Collection", "Collection and completion achievements"),
    CHALLENGE("Challenge", "Specific challenge completion achievements");

    private final String displayName;
    private final String description;

    AchievementCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
