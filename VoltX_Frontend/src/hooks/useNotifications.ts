import { useEffect, useState } from 'react';

export const useNotifications = () => {
  const [count, setCount] = useState(0);
  const token = localStorage.getItem('token');

  const fetchCount = async () => {
    try {
      const res = await fetch('/api/notifications/unread-count', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setCount(d.count || 0); }
    } catch { }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { count, refresh: fetchCount };
};
