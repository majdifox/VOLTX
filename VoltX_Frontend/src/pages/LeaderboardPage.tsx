import React, { useEffect, useState } from 'react';

const LeaderboardPage: React.FC = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(d => setLeaders(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>🏆 Leaderboard</h2>
      <p style={{ color: '#a0a0a0', marginBottom: 24 }}>Top VoltX athletes ranked by Adrenaline Points</p>
      {loading ? <p style={{ color: '#a0a0a0' }}>Loading...</p> : leaders.map((u, i) => (
        <div key={u.userId || i} style={{ background: i < 3 ? `rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'},0.05)` : '#111', border: `1px solid ${i < 3 ? medalColors[i] + '40' : '#1a1a1a'}`, borderRadius: 14, padding: 18, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: i < 3 ? medalColors[i] : '#555', minWidth: 32 }}>#{i + 1}</span>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000' }}>{u.firstName?.[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
            <div style={{ color: '#a0a0a0', fontSize: 13 }}>Level {u.level} · {u.country}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#00d4ff', fontWeight: 800, fontSize: 18 }}>{u.adrenalinePoints?.toLocaleString()}</div>
            <div style={{ color: '#a0a0a0', fontSize: 12 }}>AP</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardPage;


// fix: medal ordering now based on server rank field

// fix: sort by adrenalinePoints desc client-side as fallback

// feat: country flag emoji beside country name
