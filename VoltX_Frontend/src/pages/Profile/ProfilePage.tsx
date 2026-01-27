import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  StatusBadge,
  LevelBadge,
  Modal
} from '../../components/UI';
import {
  UserCard,
  LevelProgress
} from '../../components/User';
import {
  ProfileEditForm
} from '../../components/Forms';
import {
  StatsCard,
  ProgressChart
} from '../../components/Data';
import {
  Breadcrumb,
  createBreadcrumbs
} from '../../components/Navigation';
import { THEME } from '../../config/theme';
import { formatters, dateUtils } from '../../utils';
import type { UserDTO } from '../../types/user';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements'>('overview');

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // For now, we'll display the current user's profile
  // In a complete implementation, we'd fetch user data by username
  const profileUser: UserDTO = currentUser;
  const isOwnProfile = !username || username === currentUser.username;

  // Mock data for demonstration
  const userStats = [
    {
      label: 'Events Completed',
      value: 12,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'success' as const
    },
    {
      label: 'Achievements Unlocked',
      value: 8,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'warning' as const
    },
    {
      label: 'Days Active',
      value: 45,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'primary' as const
    },
    {
      label: 'Safety Rating',
      value: 95,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'secondary' as const
    }
  ];

  const skillsData = [
    { label: 'Sky Diving', value: 85, maxValue: 100, color: THEME.colors.primary },
    { label: 'Rock Climbing', value: 70, maxValue: 100, color: THEME.colors.secondary },
    { label: 'Bungee Jumping', value: 60, maxValue: 100, color: THEME.colors.success },
    { label: 'Paragliding', value: 45, maxValue: 100, color: THEME.colors.warning }
  ];

  const handleEditSuccess = (updatedUser: UserDTO) => {
    setIsEditing(false);
    // In a real app, you'd update the global user state here
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'activity', label: 'Activity', icon: '📊' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb items={createBreadcrumbs.profile(profileUser.username)} />

        {/* Profile Header */}
        <div className="mt-6">
          <Card variant="elevated">
            <CardBody>
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                  {profileUser.firstName?.charAt(0).toUpperCase()}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {formatters.formatFullName(profileUser.firstName || '', profileUser.lastName || '')}
                    </h1>
                    <StatusBadge status={profileUser.accountStatus?.toLowerCase() as any || 'active'} />
                    <LevelBadge level={profileUser.level || 1} />
                  </div>

                  <p className="text-lg text-gray-600 mb-2">
                    {formatters.formatUsername(profileUser.username || '')}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Joined {profileUser.createdAt ? dateUtils.formatDate(profileUser.createdAt) : 'Recently'}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>{formatters.formatPoints(profileUser.adrenalinePoints || 0)} points</span>
                    </div>

                    <Badge variant="primary" size="sm">
                      {profileUser.role}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                {isOwnProfile && (
                  <div className="flex space-x-3">
                    <Button
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Level Progress */}
        {isOwnProfile && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Level Progress
                </h3>
              </CardHeader>
              <CardBody>
                <LevelProgress
                  currentPoints={profileUser.adrenalinePoints || 0}
                  currentLevel={profileUser.level || 1}
                  showDetails={true}
                  size="lg"
                />
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? `border-[${THEME.colors.primary}] text-[${THEME.colors.primary}]`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <StatsCard
                title="Profile Statistics"
                stats={userStats}
                variant="default"
              />

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Skills & Experience
                  </h3>
                </CardHeader>
                <CardBody>
                  <ProgressChart
                    data={skillsData}
                    orientation="horizontal"
                    showValues={true}
                    showPercentages={true}
                  />
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'activity' && (
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
                      <p className="font-medium text-gray-900">Completed Advanced Sky Diving</p>
                      <p className="text-sm text-gray-600">Earned 500 adrenaline points • 3 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 bg-[${THEME.colors.primary}] rounded-full`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Unlocked "Fearless" Achievement</p>
                      <p className="text-sm text-gray-600">Level 5 milestone reached • 1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 bg-[${THEME.colors.secondary}] rounded-full`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Completed Rock Climbing Challenge</p>
                      <p className="text-sm text-gray-600">Mountain expedition series • 2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'achievements' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Achievements & Badges
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mock achievements */}
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏆</div>
                      <h4 className="font-semibold text-gray-900">First Steps</h4>
                      <p className="text-sm text-gray-600">Completed first event</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">⚡</div>
                      <h4 className="font-semibold text-gray-900">Adrenaline Hunter</h4>
                      <p className="text-sm text-gray-600">Earned 1000 points</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎯</div>
                      <h4 className="font-semibold text-gray-900">Precision Master</h4>
                      <p className="text-sm text-gray-600">Perfect safety record</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Profile"
          size="lg"
        >
          <ProfileEditForm
            user={profileUser}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        </Modal>
      </div>
    </div>
  );
};