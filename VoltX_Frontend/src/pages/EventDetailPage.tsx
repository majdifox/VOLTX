import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(r => r.json())
      .then(setEvent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch(`/api/events/${id}/apply`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) setMsg('Application submitted!');
      else setMsg('Could not apply');
    } catch { setMsg('Error'); }
    setApplying(false);
  };

  if (loading) return <div style={{ padding: 24, color: '#a0a0a0' }}>Loading event...</div>;
  if (!event) return <div style={{ padding: 24, color: '#ff2d55' }}>Event not found.</div>;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer', marginBottom: 20, fontSize: 15 }}>← Back</button>
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 20, padding: 32 }}>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{event.name}</h1>
        {event.description && <p style={{ color: '#a0a0a0', lineHeight: 1.7, marginBottom: 24 }}>{event.description}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          {event.location && <span style={{ color: '#e0e0e0', fontSize: 14 }}>📍 {event.location}</span>}
          {event.riskLevel && <span style={{ color: '#ffab00', fontSize: 14 }}>⚠️ {event.riskLevel}</span>}
          {event.rewardPoints && <span style={{ color: '#00d4ff', fontSize: 14 }}>⚡ {event.rewardPoints} AP</span>}
        </div>
        {msg && <div style={{ marginBottom: 16, color: msg.includes('submitted') ? '#00e676' : '#ff2d55', fontWeight: 600 }}>{msg}</div>}
        <button onClick={handleApply} disabled={applying} style={{ background: '#00d4ff', color: '#000', padding: '12px 30px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none', opacity: applying ? 0.7 : 1 }}>
          {applying ? 'Applying...' : 'Apply to Join'}
        </button>
      </div>
    </div>
  );
};

export default EventDetailPage;

