import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(d => setUser(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 24, color: '#a0a0a0' }}>Loading profile...</div>;
  if (!user) return <div style={{ padding: 24, color: '#ff2d55' }}>User not found.</div>;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ height: 140, background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)' }} />
        <div style={{ padding: 24, marginTop: -50 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 28, color: '#000', border: '4px solid #111' }}>
            {user.firstName?.[0]}
          </div>
          <h1 style={{ color: '#fff', marginTop: 12, fontWeight: 700, fontSize: 22 }}>{user.firstName} {user.lastName}</h1>
          <p style={{ color: '#a0a0a0', fontSize: 14 }}>@{user.username}</p>
          {user.bio && <p style={{ color: '#e0e0e0', marginTop: 12, lineHeight: 1.6 }}>{user.bio}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
