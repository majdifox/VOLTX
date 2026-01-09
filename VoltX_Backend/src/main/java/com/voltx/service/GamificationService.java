package com.voltx.service;

import org.springframework.stereotype.Service;

@Service
public class GamificationService {

    private static final int[] LEVEL_THRESHOLDS = {
        0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000,
        15000, 20000, 26000, 33000, 41000
    };

    public int calculateLevel(int adrenalinePoints) {
        for (int i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (adrenalinePoints >= LEVEL_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    }

    public int getPointsToNextLevel(int currentPoints) {
        int currentLevel = calculateLevel(currentPoints);
        if (currentLevel >= LEVEL_THRESHOLDS.length) {
            return 0;
        }
        return LEVEL_THRESHOLDS[currentLevel] - currentPoints;
    }

    public int getPointsForCurrentLevel(int currentPoints) {
        int currentLevel = calculateLevel(currentPoints);
        if (currentLevel == 1) {
            return 0;
        }
        return currentPoints - LEVEL_THRESHOLDS[currentLevel - 2];
    }
}
