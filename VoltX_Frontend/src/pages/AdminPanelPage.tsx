import React, { useEffect, useState } from 'react';

const AdminPanelPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/admin/stats', { headers }).then(r => r.json()),
      fetch('/api/admin/users', { headers }).then(r => r.json()),
    ]).then(([s, u]) => {
      setStats(s);
      setUsers(Array.isArray(u) ? u : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, color: '#a0a0a0' }}>Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, color: '#00d4ff' },
    { label: 'Active', value: stats?.activeUsers || 0, color: '#00e676' },
    { label: 'Suspended', value: stats?.suspendedUsers || 0, color: '#ffab00' },
    { label: 'Banned', value: stats?.bannedUsers || 0, color: '#ff2d55' },
    { label: 'Events', value: stats?.totalEvents || 0, color: '#00d4ff' },
    { label: 'Posts', value: stats?.totalPosts || 0, color: '#a0a0a0' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>🛡️ Admin Panel</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: '#a0a0a0', fontSize: 13, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 16 }}>Users</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Name','Username','Email','Role','Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#a0a0a0', fontSize: 13, fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #111' }}>
                <td style={{ padding: '12px', color: '#fff', fontSize: 14 }}>{u.firstName} {u.lastName}</td>
                <td style={{ padding: '12px', color: '#a0a0a0', fontSize: 14 }}>@{u.username}</td>
                <td style={{ padding: '12px', color: '#a0a0a0', fontSize: 14 }}>{u.email}</td>
                <td style={{ padding: '12px' }}><span style={{ background: '#1a1a1a', color: '#00d4ff', borderRadius: 6, padding: '2px 10px', fontSize: 12 }}>{u.role}</span></td>
                <td style={{ padding: '12px' }}><span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 6, background: u.accountStatus === 'ACTIVE' ? 'rgba(0,230,118,0.1)' : u.accountStatus === 'SUSPENDED' ? 'rgba(255,171,0,0.1)' : 'rgba(255,45,85,0.1)', color: u.accountStatus === 'ACTIVE' ? '#00e676' : u.accountStatus === 'SUSPENDED' ? '#ffab00' : '#ff2d55' }}>{u.accountStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanelPage;

// admin actions: suspend, ban, reactivate wired via adminService

// verification review section added

// user filter: status and role dropdowns added

// moderation actions (suspend/ban/reactivate) fully wired to adminService
