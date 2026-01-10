import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/userService';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './Profile.css';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();

  // Determine profile to show: param username or current user
  const profileUsername = username || currentUser?.username;
  const isOwnProfile = !username || username === currentUser?.username;

  const {
    data: profileUser,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user', profileUsername],
    queryFn: () => profileUsername ? userService.getUserByUsername(profileUsername) : null,
    enabled: !!profileUsername,
  });

  if (isLoading) {
    return (
      <div className="profile-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="profile-error">
        <h3>User not found</h3>
        <p>The user you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-banner">
          {profileUser.bannerPicture && (
            <img src={profileUser.bannerPicture} alt="Banner" className="banner-image" />
          )}
        </div>

        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src={profileUser.profilePicture || '/default-avatar.png'}
              alt={profileUser.username}
              className="avatar-image"
            />
            {profileUser.verified && (
              <div className="verified-badge">✓</div>
            )}
          </div>

          <div className="profile-details">
            <div className="profile-name">
              <h1>{profileUser.firstName} {profileUser.lastName}</h1>
              <p className="username">@{profileUser.username}</p>
              <div className="profile-badges">
                <span className="level-badge">Level {profileUser.level}</span>
                <span className="points-badge">{profileUser.adrenalinePoints} AP</span>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{profileUser.followersCount}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{profileUser.followingCount}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>

            <div className="profile-actions">
              {isOwnProfile ? (
                <button className="btn btn-primary">Edit Profile</button>
              ) : (
                <button className="btn btn-primary">
                  {profileUser.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button className="tab active">Posts</button>
          <button className="tab">Events</button>
          <button className="tab">About</button>
        </div>

        <div className="profile-feed">
          <div className="empty-content">
            <p>No posts yet...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;