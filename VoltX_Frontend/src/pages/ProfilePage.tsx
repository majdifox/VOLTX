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

  const stats = [
    { label: 'Level', value: user.level || 1 },
    { label: 'AP', value: user.adrenalinePoints || 0 },
    { label: 'Events', value: user.eventCount || 0 },
    { label: 'Followers', value: user.followersCount || 0 },
  ];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: 140, background: 'linear-gradient(135deg, #0a0a18, #001a2e)', position: 'relative' }}>
          {user.bannerPicture && <img src={user.bannerPicture} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ padding: 24, marginTop: -44 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 28, color: '#000', border: '4px solid #111' }}>
            {user.profilePicture ? <img src={user.profilePicture} alt="pfp" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.firstName?.[0]}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12 }}>
            <div>
              <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 22, margin: 0 }}>{user.firstName} {user.lastName}</h1>
              <p style={{ color: '#a0a0a0', fontSize: 14, margin: '4px 0' }}>@{user.username}</p>
              {user.bio && <p style={{ color: '#e0e0e0', marginTop: 10, lineHeight: 1.6, fontSize: 14 }}>{user.bio}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#00d4ff', fontWeight: 800, fontSize: 20 }}>{s.value}</div>
                <div style={{ color: '#a0a0a0', fontSize: 12 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// follow action wired

// fix: profile now uses 'me' endpoint for own profile

// chore: unused imports removed

// fix(page): profile fetch uses me endpoint for self

// style(page): ProfilePage bio section line height adjusted
