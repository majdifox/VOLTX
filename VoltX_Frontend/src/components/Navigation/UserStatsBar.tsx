import React from 'react';
import { useAuthStore } from '../../stores/authStore';

const UserStatsBar: React.FC = () => {
  const { user } = useAuthStore();
  if (!user) return null;
  const isSuspended = user.accountStatus?.toUpperCase() === 'SUSPENDED';
  if (isSuspended) return <span style={{ color: '#ffab00', fontSize: 13, fontWeight: 600 }}>⚠️ Suspended</span>;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <span style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14 }}>⚡ {user.adrenalinePoints || 0} AP</span>
      <span style={{ color: '#a0a0a0', fontSize: 13, background: '#1a1a1a', padding: '2px 10px', borderRadius: 6 }}>Lv.{user.level || 1}</span>
    </div>
  );
};

export default UserStatsBar;

// style(layout): UserStatsBar font weight 800 for AP number
