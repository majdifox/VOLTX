import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatsCard,
  Badge,
  LevelBadge,
  PointsBadge,
  LoadingSpinner,
  Skeleton
} from '../../components/UI';
import { useLeaderboardUpdates } from '../../hooks/useWebSocket';
import { apiService } from '../../services/apiService';
import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UsersIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface LeaderboardUser {
  rank: number;
  username: string;
  name: string;
  level: number;
  adrenalinePoints: number;
  totalAchievements: number;
  weeklyPoints: number;
  avatar?: string;
  trend?: 'up' | 'down' | 'stable';
  rankChange?: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  userRank: number;
  totalUsers: number;
  currentUser: LeaderboardUser;
}

export const LeaderboardPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'all-time' | 'weekly' | 'monthly'>('all-time');
  const [category, setCategory] = useState<'points' | 'level' | 'achievements'>('points');
  const { lastUpdate } = useLeaderboardUpdates();

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading, refetch } = useQuery({
    queryKey: ['leaderboard', timeframe, category],
    queryFn: () => apiService.get(`/gamification/leaderboard?timeframe=${timeframe}&category=${category}`),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // 1 minute
  });

  // Refetch when WebSocket update received
  useEffect(() => {
    if (lastUpdate) {
      refetch();
    }
  }, [lastUpdate, refetch]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable', change?: number) => {
    if (!trend || !change) return null;

    if (trend === 'up') {
      return (
        <div className="flex items-center text-green-600">
          <ChevronUpIcon className="w-4 h-4" />
          <span className="text-xs">+{change}</span>
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center text-red-600">
          <ChevronDownIcon className="w-4 h-4" />
          <span className="text-xs">-{change}</span>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
                <Skeleton className="w-8 h-8 rounded-full mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const data: LeaderboardData = leaderboardData?.data || {
    leaderboard: [],
    userRank: 0,
    totalUsers: 0,
    currentUser: {} as LeaderboardUser
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🏆 Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          See how you rank among VoltX adventurers worldwide
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['all-time', 'weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${timeframe === period
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }
              `}
            >
              {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['points', 'level', 'achievements'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${category === cat
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }
              `}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Your Rank"
          value={data.userRank ? `#${data.userRank}` : 'Unranked'}
          subtitle={`of ${data.totalUsers.toLocaleString()} users`}
          icon={TrophyIcon}
          trend={data.currentUser?.trend ? {
            value: data.currentUser.rankChange || 0,
            label: 'from last week',
            isPositive: data.currentUser.trend === 'up'
          } : undefined}
        />

        <StatsCard
          title="Your Points"
          value={data.currentUser?.adrenalinePoints?.toLocaleString() || '0'}
          subtitle="Adrenaline Points"
          icon={FireIcon}
        />

        <StatsCard
          title="Your Level"
          value={data.currentUser?.level || 1}
          subtitle="Current Level"
          icon={StarIcon}
        />

        <StatsCard
          title="Achievements"
          value={data.currentUser?.totalAchievements || 0}
          subtitle="Unlocked"
          icon={CalendarDaysIcon}
        />
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrophyIcon className="w-6 h-6 mr-2" />
              Top Performers
            </CardTitle>
            <Badge variant="info" className="text-xs">
              Updated {lastUpdate ? 'just now' : 'recently'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {data.leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No data available
              </h3>
              <p className="text-gray-500">
                Check back later for leaderboard updates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.leaderboard.map((user, index) => (
                <div
                  key={user.username}
                  className={`
                    flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                    ${user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10' : ''}
                  `}
                >
                  {/* Rank */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 ${
                    user.rank <= 3
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <span className={`font-bold ${user.rank <= 3 ? 'text-lg' : 'text-sm'} ${getRankColor(user.rank)}`}>
                      {getRankIcon(user.rank)}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.name || user.username}
                      </h3>
                      {user.rank <= 3 && (
                        <Badge variant="warning" size="xs" className="ml-2">
                          Elite
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        @{user.username}
                      </span>

                      <LevelBadge level={user.level} className="scale-75" />

                      <PointsBadge
                        points={user.adrenalinePoints}
                        className="scale-75"
                      />

                      <Badge variant="secondary" size="xs">
                        {user.totalAchievements} achievements
                      </Badge>
                    </div>
                  </div>

                  {/* Trend & Stats */}
                  <div className="flex items-center space-x-4">
                    {timeframe === 'weekly' && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          +{user.weeklyPoints?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          this week
                        </div>
                      </div>
                    )}

                    {getTrendIcon(user.trend, user.rankChange)}

                    <div className="text-right min-w-0">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {category === 'points' ? user.adrenalinePoints.toLocaleString() :
                         category === 'level' ? user.level :
                         user.totalAchievements}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category === 'points' ? 'AP' :
                         category === 'level' ? 'Level' :
                         'Achievements'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Performance Card */}
      {data.currentUser && data.userRank > 10 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Current Standing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full mr-4">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  #{data.userRank}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {data.currentUser.name || data.currentUser.username}
                </h3>
                <div className="flex items-center space-x-4 text-sm">
                  <LevelBadge level={data.currentUser.level} className="scale-75" />
                  <PointsBadge points={data.currentUser.adrenalinePoints} className="scale-75" />
                  <Badge variant="secondary" size="xs">
                    {data.currentUser.totalAchievements} achievements
                  </Badge>
                </div>
              </div>

              {getTrendIcon(data.currentUser.trend, data.currentUser.rankChange)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};