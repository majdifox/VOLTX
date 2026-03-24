import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const BannedPage: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Inter, sans-serif', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>🚫</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#ff2d55', marginBottom: 16 }}>Account Banned</h1>
        <p style={{ color: '#a0a0a0', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
          Your account has been permanently banned for violating our community guidelines.<br />
          If you believe this is a mistake, please contact support.
        </p>
        <button onClick={handleLogout} style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid #ff2d55', color: '#ff2d55', padding: '14px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default BannedPage;

// style: premium red gradient applied
