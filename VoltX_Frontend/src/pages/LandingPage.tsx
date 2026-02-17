import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '⚡', title: 'Adrenaline Points', desc: 'Earn AP for every challenge you complete.' },
    { icon: '🏆', title: 'Leaderboards', desc: 'Compete globally and climb the ranks.' },
    { icon: '🎯', title: 'Events', desc: 'Join or organize extreme sports events.' },
  ];

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ color: '#00d4ff', fontWeight: 900, fontSize: 28, letterSpacing: -1 }}>⚡ VOLTX</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}>Login</button>
          <button onClick={() => navigate('/register')} style={{ background: '#00d4ff', color: '#000', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Get Started</button>
        </div>
      </header>

      <main>
        <section style={{ textAlign: 'center', padding: '100px 20px 60px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 20, padding: '4px 16px', marginBottom: 24, color: '#00d4ff', fontSize: 14 }}>
            🔥 The #1 Extreme Sports Platform
          </div>
          <h1 style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>
            Push Your <span style={{ color: '#00d4ff' }}>Limits.</span><br />
            Own Your <span style={{ color: '#ff6a00' }}>Journey.</span>
          </h1>
          <p style={{ fontSize: 20, color: '#a0a0a0', maxWidth: 560, margin: '0 auto 40px' }}>
            Connect with extreme sports enthusiasts, join organized events, and earn Adrenaline Points as you level up.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ background: '#00d4ff', color: '#000', padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>
              Start for Free
            </button>
            <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '16px 40px', borderRadius: 12, fontSize: 18, cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
        </section>

        <section style={{ display: 'flex', gap: 24, justifyContent: 'center', padding: '60px 40px', flexWrap: 'wrap' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 32, maxWidth: 280, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#a0a0a0', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
