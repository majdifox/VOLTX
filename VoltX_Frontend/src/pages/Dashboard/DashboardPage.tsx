import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardBody } from '../../components/UI';
import { StatsCard, ProgressChart } from '../../components/Data';
import { LevelProgress } from '../../components/User';
import { Breadcrumb } from '../../components/Navigation';
import { THEME } from '../../config/theme';
import { formatters } from '../../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const userStats = [
    {
      label: 'Current Level',
      value: user.level || 1,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'primary' as const,
      change: 5,
      trend: 'up' as const
    },
    {
      label: 'Adrenaline Points',
      value: user.adrenalinePoints || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'secondary' as const,
      change: 12,
      trend: 'up' as const
    },
    {
      label: 'Events Joined',
      value: 8,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'success' as const,
      change: 3,
      trend: 'up' as const
    },
    {
      label: 'Achievements',
      value: 15,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'warning' as const,
      change: 1,
      trend: 'up' as const
    }
  ];

  const activityData = [
    {
      label: 'Events Completed',
      value: 6,
      maxValue: 10,
      color: THEME.colors.success
    },
    {
      label: 'Challenges Won',
      value: 4,
      maxValue: 8,
      color: THEME.colors.primary
    },
    {
      label: 'Skills Mastered',
      value: 3,
      maxValue: 5,
      color: THEME.colors.secondary
    },
    {
      label: 'Safety Rating',
      value: 9,
      maxValue: 10,
      color: THEME.colors.warning
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb />
          <div className="mt-4">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="mt-2 text-gray-600">
                  Track your progress and manage your VoltX adventure
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4">
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Current Status</p>
                    <p className={`font-semibold text-[${THEME.colors.primary}]`}>
                      {user.accountStatus}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.firstName?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <StatsCard
            title="Your Stats Overview"
            stats={userStats}
            variant="default"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Level Progress */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Level Progress
                </h3>
              </CardHeader>
              <CardBody>
                <LevelProgress
                  currentPoints={user.adrenalinePoints || 0}
                  currentLevel={user.level || 1}
                  showDetails={true}
                  size="lg"
                />
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <button className={`w-full text-left p-3 rounded-lg border hover:bg-[${THEME.colors.primary}]/5 hover:border-[${THEME.colors.primary}] transition-colors`}>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Browse Events</span>
                    </div>
                  </button>

                  <button className={`w-full text-left p-3 rounded-lg border hover:bg-[${THEME.colors.primary}]/5 hover:border-[${THEME.colors.primary}] transition-colors`}>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">View Profile</span>
                    </div>
                  </button>

                  <button className={`w-full text-left p-3 rounded-lg border hover:bg-[${THEME.colors.primary}]/5 hover:border-[${THEME.colors.primary}] transition-colors`}>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                      </svg>
                      <span className="font-medium">View Statistics</span>
                    </div>
                  </button>

                  <button className={`w-full text-left p-3 rounded-lg border hover:bg-[${THEME.colors.primary}]/5 hover:border-[${THEME.colors.primary}] transition-colors`}>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">Settings</span>
                    </div>
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Activity Progress */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Activity Progress
              </h3>
              <p className="text-sm text-gray-600">
                Your performance across different areas
              </p>
            </CardHeader>
            <CardBody>
              <ProgressChart
                data={activityData}
                orientation="horizontal"
                showValues={true}
                showPercentages={true}
              />
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 bg-[${THEME.colors.success}] rounded-full`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Completed Sky Diving Challenge</p>
                    <p className="text-sm text-gray-600">Earned 250 adrenaline points • 2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 bg-[${THEME.colors.primary}] rounded-full`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Reached Level 3</p>
                    <p className="text-sm text-gray-600">Unlocked new challenges • 1 day ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 bg-[${THEME.colors.secondary}] rounded-full`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Joined Extreme Sports Event</p>
                    <p className="text-sm text-gray-600">Mountain climbing expedition • 3 days ago</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};