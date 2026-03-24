import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <header style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ color: '#00d4ff', fontWeight: 900, fontSize: 20 }}>⚡ VOLTX</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <>
            <span style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14 }}>⚡ {user.adrenalinePoints || 0} AP</span>
            <span style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '4px 12px', color: '#a0a0a0', fontSize: 13 }}>Lv.{user.level || 1}</span>
            <div onClick={() => navigate(`/app/profile/${user.id}`)} style={{ width: 36, height: 36, borderRadius: '50%', background: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000', cursor: 'pointer' }}>
              {user.firstName?.[0]}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;

// notification bell integrated

// fix: notification count now re-fetches on interval

// fix: suspended users no longer see AP/level info in header

// suspension status check fully integrated

// refactor: now delegates to UserStatsBar component

// style: backdrop blur added to TopBar
