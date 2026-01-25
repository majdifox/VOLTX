import React from "react";
import { THEME } from "../../config/theme";
import { LEVELS } from "../../config/levels";
import { formatters } from "../../utils/formatters";

interface LevelProgressProps {
  currentPoints: number;
  currentLevel: number;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  currentPoints,
  currentLevel,
  showDetails = true,
  size = "md",
  className = ""
}) => {
  // Get current and next level info
  const currentLevelInfo = LEVELS[currentLevel as keyof typeof LEVELS];
  const nextLevel = currentLevel + 1;
  const nextLevelInfo = nextLevel <= 15 ? LEVELS[nextLevel as keyof typeof LEVELS] : null;
  
  const isMaxLevel = currentLevel >= 15;
  
  // Calculate progress
  const currentThreshold = currentLevelInfo?.threshold || 0;
  const nextThreshold = nextLevelInfo?.threshold || currentThreshold;
  const pointsInLevel = currentPoints - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const progressPercentage = isMaxLevel ? 100 : Math.min(100, Math.max(0, (pointsInLevel / pointsNeeded) * 100));
  const pointsToNext = Math.max(0, nextThreshold - currentPoints);

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          container: "space-y-1",
          bar: "h-1.5",
          text: "text-xs",
          title: "text-sm"
        };
      case "lg":
        return {
          container: "space-y-3",
          bar: "h-3",
          text: "text-base", 
          title: "text-xl"
        };
      default:
        return {
          container: "space-y-2",
          bar: "h-2",
          text: "text-sm",
          title: "text-lg"
        };
    }
  };

  const styles = getSizeStyles();

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Level Title */}
      <div className="flex items-center justify-between">
        <h3 className={`${styles.title} font-semibold text-gray-900`}>
          Level {currentLevel}: {currentLevelInfo?.title}
        </h3>
        {!isMaxLevel && (
          <span className={`${styles.text} text-gray-600`}>
            {formatters.formatPointsCompact(pointsToNext)} to next
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className={`w-full ${styles.bar} bg-gray-200 rounded-full overflow-hidden`}>
          <div
            className={`
              ${styles.bar} bg-gradient-to-r from-[${THEME.colors.primary}] to-[${THEME.colors.secondary}]
              transition-all duration-500 ease-out rounded-full
            `}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Progress indicator dot */}
        <div
          className={`
            absolute top-1/2 transform -translate-y-1/2 w-3 h-3
            bg-white border-2 border-[${THEME.colors.primary}] rounded-full
            transition-all duration-500 ease-out
          `}
          style={{ left: `calc(${progressPercentage}% - 6px)` }}
        />
      </div>

      {/* Progress Details */}
      {showDetails && (
        <div className={`${styles.text} text-gray-600 space-y-1`}>
          <div className="flex justify-between">
            <span>Current Points:</span>
            <span className="font-medium text-gray-900">
              {formatters.formatPoints(currentPoints)}
            </span>
          </div>
          
          {!isMaxLevel ? (
            <>
              <div className="flex justify-between">
                <span>Next Level:</span>
                <span className="font-medium">
                  {formatters.formatPoints(nextThreshold)} pts
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className="font-medium">
                  {formatters.formatPoints(pointsInLevel)} / {formatters.formatPoints(pointsNeeded)}
                  <span className={`ml-2 text-[${THEME.colors.primary}]`}>
                    ({Math.round(progressPercentage)}%)
                  </span>
                </span>
              </div>
            </>
          ) : (
            <div className="text-center">
              <span className={`font-medium text-[${THEME.colors.success}]`}>
                🎉 Maximum Level Achieved! 🎉
              </span>
            </div>
          )}
        </div>
      )}

      {/* Next Level Preview */}
      {!isMaxLevel && nextLevelInfo && showDetails && (
        <div className={`p-3 bg-gray-50 rounded-lg border border-gray-200`}>
          <div className="flex items-center space-x-2">
            <span className={`${styles.text} text-gray-600`}>Next:</span>
            <span className={`${styles.text} font-medium text-gray-900`}>
              Level {nextLevel} - {nextLevelInfo.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Mini progress indicator for compact displays
interface MiniLevelProgressProps {
  currentPoints: number;
  currentLevel: number;
  className?: string;
}

export const MiniLevelProgress: React.FC<MiniLevelProgressProps> = ({
  currentPoints,
  currentLevel,
  className = ""
}) => {
  const currentLevelInfo = LEVELS[currentLevel as keyof typeof LEVELS];
  const nextLevel = currentLevel + 1;
  const nextLevelInfo = nextLevel <= 15 ? LEVELS[nextLevel as keyof typeof LEVELS] : null;
  
  if (!nextLevelInfo) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-xs text-gray-600">Max Level</span>
        <div className="w-16 h-1 bg-green-500 rounded-full" />
      </div>
    );
  }

  const currentThreshold = currentLevelInfo?.threshold || 0;
  const nextThreshold = nextLevelInfo.threshold;
  const pointsInLevel = currentPoints - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const progressPercentage = Math.min(100, Math.max(0, (pointsInLevel / pointsNeeded) * 100));

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-xs text-gray-600 whitespace-nowrap">
        Lvl {currentLevel}
      </span>
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden min-w-12">
        <div
          className={`h-1 bg-[${THEME.colors.primary}] rounded-full transition-all duration-300`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">
        {Math.round(progressPercentage)}%
      </span>
    </div>
  );
};
