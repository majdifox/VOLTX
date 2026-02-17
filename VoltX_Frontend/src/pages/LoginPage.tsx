import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // TODO: connect to authService
    console.log('login', { email, password });
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 20, padding: 40, width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ color: '#00d4ff', fontSize: 32, fontWeight: 900 }}>⚡ VOLTX</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Welcome back</h1>
        </div>

        {error && <div style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid #ff2d55', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#ff2d55', fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0a0' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 16, boxSizing: 'border-box' }} required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0a0' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 16, boxSizing: 'border-box' }} required />
          </div>
          <button type="submit" style={{ width: '100%', background: '#00d4ff', color: '#000', padding: '14px', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#a0a0a0', fontSize: 14 }}>
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} style={{ color: '#00d4ff', cursor: 'pointer' }}>Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
