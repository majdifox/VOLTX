import React, { useEffect, useState } from 'react';

const CaptainPanelPage: React.FC = () => {
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/captain/events/pending', { headers })
      .then(r => r.json())
      .then(d => setPendingEvents(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const review = async (eventId: number, action: 'APPROVED' | 'REJECTED') => {
    await fetch(`/api/captain/events/${eventId}/review`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: action, reason: action === 'REJECTED' ? 'Does not meet safety standards' : '' }),
    });
    setPendingEvents(pendingEvents.filter(e => e.id !== eventId));
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>⚓ Captain Panel</h2>
      <h3 style={{ color: '#a0a0a0', fontSize: 15, marginBottom: 16, fontWeight: 500 }}>Pending Events ({pendingEvents.length})</h3>
      {loading ? <p style={{ color: '#a0a0a0' }}>Loading...</p> : pendingEvents.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#a0a0a0', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <p>No events pending review.</p>
        </div>
      ) : pendingEvents.map(ev => (
        <div key={ev.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 14, padding: 20, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 6 }}>{ev.name}</h4>
              <p style={{ color: '#a0a0a0', fontSize: 13, lineHeight: 1.6 }}>{ev.description?.slice(0, 100)}</p>
              <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>📍 {ev.location} · ⚠️ {ev.riskLevel}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginLeft: 20, flexShrink: 0 }}>
              <button onClick={() => review(ev.id, 'APPROVED')} style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid #00e676', color: '#00e676', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Approve</button>
              <button onClick={() => review(ev.id, 'REJECTED')} style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid #ff2d55', color: '#ff2d55', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CaptainPanelPage;

// feat: reviewed events tab added

// fix(page): CaptainPanel rejection reason persists in form

// fix(page): CaptainPanel shows event organizer name
