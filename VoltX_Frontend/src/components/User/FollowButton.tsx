import React, { useState } from 'react';

interface Props { userId: number; initialFollowing?: boolean; }

const FollowButton: React.FC<Props> = ({ userId, initialFollowing = false }) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const toggle = async () => {
    setLoading(true);
    try {
      const method = following ? 'DELETE' : 'POST';
      await fetch(`/api/users/${userId}/${following ? 'unfollow' : 'follow'}`, { method, headers: { Authorization: `Bearer ${token}` } });
      setFollowing(!following);
    } catch { }
    setLoading(false);
  };

  return (
    <button onClick={toggle} disabled={loading} style={{ background: following ? 'transparent' : '#00d4ff', color: following ? '#a0a0a0' : '#000', border: `1px solid ${following ? '#2a2a2a' : '#00d4ff'}`, borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' }}>
      {following ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;

// style(component): FollowButton active glow effect
