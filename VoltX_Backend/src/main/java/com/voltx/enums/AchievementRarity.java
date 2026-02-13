package com.voltx.enums;

/**
 * Rarity levels for achievements in the VoltX platform
 */
public enum AchievementRarity {
    COMMON("Common", 1.0, "#6b7280", "Easy to unlock achievements"),
    UNCOMMON("Uncommon", 1.5, "#059669", "Moderately difficult achievements"),
    RARE("Rare", 2.0, "#2563eb", "Challenging achievements"),
    EPIC("Epic", 3.0, "#7c3aed", "Very difficult achievements"),
    LEGENDARY("Legendary", 5.0, "#dc2626", "Extremely rare achievements"),
    MYTHIC("Mythic", 10.0, "#f59e0b", "Nearly impossible achievements");

    private final String displayName;
    private final double pointsMultiplier;
    private final String color;
    private final String description;

    AchievementRarity(String displayName, double pointsMultiplier, String color, String description) {
        this.displayName = displayName;
        this.pointsMultiplier = pointsMultiplier;
        this.color = color;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getPointsMultiplier() {
        return pointsMultiplier;
    }

    public String getColor() {
        return color;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Calculate points reward based on base points and rarity multiplier
     */
    public int calculateReward(int basePoints) {
        return (int) Math.round(basePoints * pointsMultiplier);
    }

    @Override
    public String toString() {
        return displayName;
    }
}
