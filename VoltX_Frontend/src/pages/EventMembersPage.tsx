import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const EventMembersPage: React.FC = () => {
  const { id } = useParams();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`/api/events/${id}/members`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setMembers(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const kick = async (memberId: number) => {
    await fetch(`/api/events/${id}/kick/${memberId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setMembers(members.filter(m => m.id !== memberId));
  };

  const accept = async (memberId: number) => {
    await fetch(`/api/events/${id}/accept/${memberId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setMembers(members.map(m => m.id === memberId ? { ...m, status: 'ACCEPTED' } : m));
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>Event Members</h2>
      {loading ? <p style={{ color: '#a0a0a0' }}>Loading...</p> : members.map(m => (
        <div key={m.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700 }}>{m.user?.firstName?.[0]}</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{m.user?.firstName} {m.user?.lastName}</div>
              <div style={{ color: '#a0a0a0', fontSize: 12 }}>{m.status}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {m.status === 'PENDING' && <button onClick={() => accept(m.id)} style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid #00e676', color: '#00e676', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>Accept</button>}
            <button onClick={() => kick(m.id)} style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid #ff2d55', color: '#ff2d55', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>Kick</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventMembersPage;
