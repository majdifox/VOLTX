import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#00d4ff', fontWeight: 900, fontSize: 28 }}>⚡ VOLTX</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff', padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}>Login</button>
          <button onClick={() => navigate('/register')} style={{ background: '#00d4ff', color: '#000', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Register</button>
        </div>
      </header>
      <main style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 style={{ fontSize: 56, fontWeight: 900, marginBottom: 20 }}>
          Push Your <span style={{ color: '#00d4ff' }}>Limits</span>
        </h1>
        <p style={{ fontSize: 20, color: '#a0a0a0', marginBottom: 40 }}>
          The platform for extreme sports enthusiasts.
        </p>
        <button onClick={() => navigate('/register')} style={{ background: '#00d4ff', color: '#000', padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>
          Get Started
        </button>
      </main>
    </div>
  );
};

export default LandingPage;
