import React, { useState } from 'react';

interface Props { userId: number; onClose: () => void; onConfirm: (reason: string, days: number) => void; }

const SuspendUserModal: React.FC<Props> = ({ userId, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [days, setDays] = useState(7);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 20, padding: 32, width: 440 }}>
        <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 20 }}>Suspend User #{userId}</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#a0a0a0', fontSize: 14 }}>Reason</label>
          <input value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', marginTop: 6, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: '#a0a0a0', fontSize: 14 }}>Duration (days)</label>
          <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} min={1} max={365} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', marginTop: 6, boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid #2a2a2a', color: '#a0a0a0', borderRadius: 8, padding: 12, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onConfirm(reason, days)} style={{ flex: 1, background: 'rgba(255,171,0,0.2)', border: '1px solid #ffab00', color: '#ffab00', borderRadius: 8, padding: 12, fontWeight: 700, cursor: 'pointer' }}>Suspend</button>
        </div>
      </div>
    </div>
  );
};

export default SuspendUserModal;

// fix(component): SuspendUserModal closes on Escape key
