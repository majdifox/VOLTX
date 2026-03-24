import { useState } from 'react';

export const useFollow = (userId: number, initial = false) => {
  const [following, setFollowing] = useState(initial);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const toggle = async () => {
    setLoading(true);
    try {
      const url = `/api/users/${userId}/${following ? 'unfollow' : 'follow'}`;
      const method = following ? 'DELETE' : 'POST';
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setFollowing(!following);
    } catch { }
    setLoading(false);
  };

  return { following, loading, toggle };
};

// fix(hook): useFollow now handles network error gracefully
