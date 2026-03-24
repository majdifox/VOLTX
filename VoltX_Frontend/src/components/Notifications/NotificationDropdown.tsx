import React, { useEffect, useRef } from 'react';

interface Props { notifications: any[]; onClose: () => void; onMarkRead: (id: number) => void; }

const NotificationDropdown: React.FC<Props> = ({ notifications, onClose, onMarkRead }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 340, maxHeight: 420, overflowY: 'auto', background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 200 }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Notifications</span>
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#a0a0a0', fontSize: 14 }}>No notifications</div>
      ) : notifications.map(n => (
        <div key={n.id} onClick={() => onMarkRead(n.id)} style={{ padding: '12px 16px', borderBottom: '1px solid #111', background: n.read ? 'transparent' : 'rgba(0,212,255,0.04)', cursor: 'pointer' }}>
          <p style={{ color: '#e0e0e0', fontSize: 13, lineHeight: 1.5 }}>{n.message}</p>
          <p style={{ color: '#555', fontSize: 11, marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationDropdown;

// style(component): NotificationDropdown smooth scroll for overflow
