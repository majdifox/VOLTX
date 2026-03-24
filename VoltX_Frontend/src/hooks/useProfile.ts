import { useState, useEffect } from 'react';

export const useProfile = (userId: number | string) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error('User not found'); return r.json(); })
      .then(setUser)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
};

// refactor(hook): useProfile now accepts string userId
