// Utility functions for formatting data
export const formatters = {
  // Number formatting
  formatNumber: (num: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat('en-US', options).format(num);
  },

  // Format adrenaline points with separators
  formatPoints: (points: number): string => {
    return new Intl.NumberFormat('en-US').format(points);
  },

  // Format points with K, M notation
  formatPointsCompact: (points: number): string => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    }
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  },

  // Date formatting
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(dateObj);
  },

  // Time ago formatting
  formatTimeAgo: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  },

  // Username display
  formatUsername: (username: string): string => {
    return `@${username}`;
  },

  // Full name display
  formatFullName: (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
  },

  // Level progress calculation
  calculateLevelProgress: (points: number, currentLevelThreshold: number, nextLevelThreshold: number): number => {
    const pointsInLevel = points - currentLevelThreshold;
    const pointsNeededForLevel = nextLevelThreshold - currentLevelThreshold;
    return Math.round((pointsInLevel / pointsNeededForLevel) * 100);
  },

  // Text truncation
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  // Capitalize first letter
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
};

// Date constants
export const DATE_FORMATS = {
  SHORT: { month: 'short', day: 'numeric' } as const,
  LONG: { year: 'numeric', month: 'long', day: 'numeric' } as const,
  TIME: { hour: '2-digit', minute: '2-digit' } as const,
  DATETIME: { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  } as const
};
