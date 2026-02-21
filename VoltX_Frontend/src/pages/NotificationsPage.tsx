import React, { useEffect, useState } from 'react';

const NotificationsPage: React.FC = () => {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(d => setNotifs(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>Notifications</h2>
      {loading ? <p style={{ color: '#a0a0a0' }}>Loading...</p> : notifs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#a0a0a0', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <p>No notifications yet.</p>
        </div>
      ) : notifs.map(n => (
        <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{ background: n.read ? '#111' : 'rgba(0,212,255,0.05)', border: `1px solid ${n.read ? '#1a1a1a' : '#00d4ff40'}`, borderRadius: 12, padding: 16, marginBottom: 10, cursor: n.read ? 'default' : 'pointer' }}>
          <p style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 1.6 }}>{n.message}</p>
          <p style={{ color: '#555', fontSize: 12, marginTop: 6 }}>{new Date(n.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationsPage;
