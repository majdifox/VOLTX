package com.voltx.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class LevelService {

    // Level configuration (matches frontend levels.ts)
    private static final Map<Integer, LevelInfo> LEVELS = new HashMap<>();

    static {
        LEVELS.put(1, new LevelInfo(0, "Novice Explorer"));
        LEVELS.put(2, new LevelInfo(100, "Thrill Seeker"));
        LEVELS.put(3, new LevelInfo(250, "Risk Taker"));
        LEVELS.put(4, new LevelInfo(500, "Adrenaline Junkie"));
        LEVELS.put(5, new LevelInfo(1000, "Extreme Athlete"));
        LEVELS.put(6, new LevelInfo(2000, "Danger Zone"));
        LEVELS.put(7, new LevelInfo(3500, "Fear Eliminator"));
        LEVELS.put(8, new LevelInfo(5500, "Action Hero"));
        LEVELS.put(9, new LevelInfo(8000, "Stunt Master"));
        LEVELS.put(10, new LevelInfo(11000, "Daredevil Legend"));
        LEVELS.put(11, new LevelInfo(15000, "Extreme Warrior"));
        LEVELS.put(12, new LevelInfo(20000, "Adrenaline God"));
        LEVELS.put(13, new LevelInfo(26000, "Ultimate Challenger"));
        LEVELS.put(14, new LevelInfo(33000, "Fearless Champion"));
        LEVELS.put(15, new LevelInfo(41000, "VoltX Master"));
    }

    public int calculateLevel(int adrenalinePoints) {
        int level = 1;
        for (int i = 15; i >= 1; i--) {
            if (adrenalinePoints >= LEVELS.get(i).threshold) {
                level = i;
                break;
            }
        }
        return level;
    }

    public String getLevelTitle(int level) {
        LevelInfo levelInfo = LEVELS.get(level);
        return levelInfo != null ? levelInfo.title : "Unknown Level";
    }

    public int getLevelThreshold(int level) {
        LevelInfo levelInfo = LEVELS.get(level);
        return levelInfo != null ? levelInfo.threshold : 0;
    }

    public int getNextLevelThreshold(int currentLevel) {
        if (currentLevel >= 15) {
            return LEVELS.get(15).threshold; // Max level reached
        }
        return getLevelThreshold(currentLevel + 1);
    }

    public int getPointsToNextLevel(int adrenalinePoints, int currentLevel) {
        if (currentLevel >= 15) {
            return 0; // Max level reached
        }
        
        int nextLevelThreshold = getNextLevelThreshold(currentLevel);
        return Math.max(0, nextLevelThreshold - adrenalinePoints);
    }

    public double getLevelProgress(int adrenalinePoints, int currentLevel) {
        if (currentLevel >= 15) {
            return 100.0; // Max level reached
        }

        int currentThreshold = getLevelThreshold(currentLevel);
        int nextThreshold = getNextLevelThreshold(currentLevel);
        
        if (nextThreshold == currentThreshold) {
            return 100.0;
        }

        int pointsInLevel = adrenalinePoints - currentThreshold;
        int pointsNeededForLevel = nextThreshold - currentThreshold;
        
        return Math.min(100.0, Math.max(0.0, (double) pointsInLevel / pointsNeededForLevel * 100));
    }

    public boolean isMaxLevel(int level) {
        return level >= 15;
    }

    public Map<String, Object> getLevelInfo(int adrenalinePoints) {
        int level = calculateLevel(adrenalinePoints);
        
        Map<String, Object> info = new HashMap<>();
        info.put("level", level);
        info.put("title", getLevelTitle(level));
        info.put("threshold", getLevelThreshold(level));
        info.put("nextThreshold", getNextLevelThreshold(level));
        info.put("pointsToNext", getPointsToNextLevel(adrenalinePoints, level));
        info.put("progress", getLevelProgress(adrenalinePoints, level));
        info.put("maxLevel", isMaxLevel(level));
        
        return info;
    }

    // Inner class for level configuration
    private static class LevelInfo {
        final int threshold;
        final String title;

        LevelInfo(int threshold, String title) {
            this.threshold = threshold;
            this.title = title;
        }
    }
}
