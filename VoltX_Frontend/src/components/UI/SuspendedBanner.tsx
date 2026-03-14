import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

const SuspendedBanner: React.FC = () => {
  const { user } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!user?.suspensionEndDate) return;
    const update = () => {
      const ms = new Date(user.suspensionEndDate!).getTime() - Date.now();
      if (ms <= 0) { setTimeLeft('Suspension expired'); return; }
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m remaining`);
    };
    update();
    const i = setInterval(update, 30000);
    return () => clearInterval(i);
  }, [user]);

  if (!user || user.accountStatus?.toUpperCase() !== 'SUSPENDED') return null;

  return (
    <div style={{ background: 'rgba(255,171,0,0.1)', border: '1px solid rgba(255,171,0,0.4)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 18 }}>⚠️</span>
      <div>
        <span style={{ color: '#ffab00', fontWeight: 600, fontSize: 14 }}>Account Suspended</span>
        {timeLeft && <span style={{ color: '#a0a0a0', fontSize: 13, marginLeft: 8 }}>· {timeLeft}</span>}
      </div>
    </div>
  );
};

export default SuspendedBanner;

