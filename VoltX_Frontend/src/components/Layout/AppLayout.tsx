import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const navItems = [
  { path: '/app/feed', icon: '🏠', label: 'Feed' },
  { path: '/app/events', icon: '🎯', label: 'Events' },
  { path: '/app/leaderboard', icon: '🏆', label: 'Ranks' },
];

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0d0d0d', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: '0 16px 24px', borderBottom: '1px solid #1a1a1a' }}>
          <div style={{ color: '#00d4ff', fontWeight: 900, fontSize: 22, letterSpacing: -1 }}>⚡ VOLTX</div>
        </div>
        <nav style={{ flex: 1, padding: 12 }}>
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 4, fontSize: 15, background: location.pathname.startsWith(item.path) ? 'rgba(0,212,255,0.1)' : 'transparent', color: location.pathname.startsWith(item.path) ? '#00d4ff' : '#a0a0a0', fontWeight: location.pathname.startsWith(item.path) ? 600 : 400 }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1a1a1a' }}>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ width: '100%', background: 'none', border: '1px solid #2a2a2a', color: '#a0a0a0', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 14 }}>Sign Out</button>
        </div>
      </aside>
      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: 24, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

// fix(layout): AppLayout main padding adjusts on mobile

// style(layout): AppLayout scrollbar hidden on sidebar
