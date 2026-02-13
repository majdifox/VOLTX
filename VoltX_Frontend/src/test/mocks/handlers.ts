import { http, HttpResponse } from 'msw';

// Mock user data
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@voltx.com',
  name: 'Test User',
  level: 5,
  adrenalinePoints: 2500,
  totalLogins: 42,
  accountStatus: 'ACTIVE',
  role: 'EXPLORER',
  createdAt: '2025-01-01T00:00:00Z',
  lastLoginAt: '2025-01-15T10:30:00Z'
};

// Mock achievements data
const mockAchievements = [
  {
    id: 1,
    achievementKey: 'first_login',
    name: 'Welcome Explorer',
    description: 'Complete your first login to VoltX',
    category: 'PROGRESSION',
    rarity: 'COMMON',
    pointsReward: 10,
    icon: '🎯',
    unlocked: true,
    unlockedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    achievementKey: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    category: 'PROGRESSION',
    rarity: 'UNCOMMON',
    pointsReward: 50,
    icon: '⭐',
    unlocked: true,
    unlockedAt: '2025-01-10T15:20:00Z'
  },
  {
    id: 3,
    achievementKey: 'points_master',
    name: 'Points Master',
    description: 'Earn 10,000 Adrenaline Points',
    category: 'COLLECTION',
    rarity: 'EPIC',
    pointsReward: 200,
    icon: '💎',
    unlocked: false
  }
];

// Mock leaderboard data
const mockLeaderboard = [
  { rank: 1, username: 'champion', level: 15, adrenalinePoints: 25000, totalAchievements: 45 },
  { rank: 2, username: 'expert_user', level: 12, adrenalinePoints: 18500, totalAchievements: 38 },
  { rank: 3, username: 'testuser', level: 5, adrenalinePoints: 2500, totalAchievements: 12 },
  { rank: 4, username: 'newcomer', level: 3, adrenalinePoints: 850, totalAchievements: 8 }
];

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: mockUser
      }
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: { ...mockUser, id: Date.now() }
      }
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: mockUser
    });
  }),

  // User endpoints
  http.get('/api/users/profile', () => {
    return HttpResponse.json({
      success: true,
      data: mockUser
    });
  }),

  http.put('/api/users/profile', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockUser, name: 'Updated Name' }
    });
  }),

  // Gamification endpoints
  http.get('/api/gamification/level', () => {
    return HttpResponse.json({
      success: true,
      data: {
        currentLevel: mockUser.level,
        currentPoints: mockUser.adrenalinePoints,
        pointsToNextLevel: 500,
        levelProgress: 75.0,
        nextLevelThreshold: 3000
      }
    });
  }),

  http.post('/api/gamification/points', () => {
    return HttpResponse.json({
      success: true,
      data: {
        pointsAwarded: 50,
        totalPoints: mockUser.adrenalinePoints + 50,
        newLevel: mockUser.level,
        leveledUp: false
      }
    });
  }),

  http.get('/api/gamification/leaderboard', () => {
    return HttpResponse.json({
      success: true,
      data: {
        leaderboard: mockLeaderboard,
        userRank: 3,
        totalUsers: 1250
      }
    });
  }),

  // Achievement endpoints
  http.get('/api/achievements', () => {
    return HttpResponse.json({
      success: true,
      data: {
        achievements: mockAchievements,
        totalUnlocked: mockAchievements.filter(a => a.unlocked).length,
        totalAvailable: mockAchievements.length,
        progressPercentage: 66.7
      }
    });
  }),

  http.get('/api/achievements/:category', ({ params }) => {
    const { category } = params;
    const filtered = mockAchievements.filter(a =>
      a.category.toLowerCase() === (category as string).toLowerCase()
    );

    return HttpResponse.json({
      success: true,
      data: filtered
    });
  }),

  http.post('/api/achievements/:id/unlock', ({ params }) => {
    const { id } = params;
    const achievement = mockAchievements.find(a => a.id === parseInt(id as string));

    if (!achievement) {
      return HttpResponse.json(
        { success: false, message: 'Achievement not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        achievement: { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() },
        pointsAwarded: achievement.pointsReward,
        newTotalPoints: mockUser.adrenalinePoints + achievement.pointsReward
      }
    });
  }),

  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  }),

  // Error simulation endpoints for testing
  http.get('/api/test/error/500', () => {
    return HttpResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  http.get('/api/test/error/401', () => {
    return HttpResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }),

  http.get('/api/test/error/network', () => {
    return HttpResponse.error();
  })
];