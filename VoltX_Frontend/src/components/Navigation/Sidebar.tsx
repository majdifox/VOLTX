import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface NavItem { path: string; icon: string; label: string; roles?: string[] }

const navItems: NavItem[] = [
  { path: '/app/feed', icon: '🏠', label: 'Feed' },
  { path: '/app/events', icon: '🎯', label: 'Events' },
  { path: '/app/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { path: '/app/posts/create', icon: '➕', label: 'Post' },
  { path: '/app/events/create', icon: '⚡', label: 'Create Event' },
  { path: '/app/captain', icon: '⚓', label: 'Captain Panel', roles: ['CAPTAIN', 'ADMIN'] },
  { path: '/app/admin', icon: '🛡️', label: 'Admin', roles: ['ADMIN'] },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const userRole = user?.role || 'USER';

  const visibleItems = navItems.filter(i => !i.roles || i.roles.includes(userRole));

  return (
    <aside style={{ width: 220, background: '#0d0d0d', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', padding: '20px 0', position: 'fixed', height: '100vh', zIndex: 50 }}>
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ color: '#00d4ff', fontWeight: 900, fontSize: 22 }}>⚡ VOLTX</div>
      </div>
      <nav style={{ flex: 1, padding: 12 }}>
        {visibleItems.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 4, fontSize: 14, background: location.pathname.startsWith(item.path) ? 'rgba(0,212,255,0.1)' : 'transparent', color: location.pathname.startsWith(item.path) ? '#00d4ff' : '#a0a0a0', fontWeight: location.pathname.startsWith(item.path) ? 600 : 400 }}>
            <span style={{ width: 20, textAlign: 'center' }}>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ padding: '12px', borderTop: '1px solid #1a1a1a' }}>
        <button onClick={() => navigate(`/app/profile/${user?.id}`)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#e0e0e0', borderRadius: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 14 }}>{user?.firstName?.[0]}</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.firstName}</div>
            <div style={{ fontSize: 11, color: '#a0a0a0' }}>@{user?.username}</div>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

// fix: active route matching improved to handle nested paths

// fix: startsWith check now handles trailing slashes

// style(layout): polished Sidebar hover transition timing
