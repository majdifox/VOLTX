import { useState, useEffect } from 'react';

export const useEvents = (organizerId?: number) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const url = organizerId ? `/api/events/organizer/${organizerId}` : '/api/events';
    fetch(url)
      .then(r => r.json())
      .then(d => setEvents(Array.isArray(d) ? d : d?.content || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [organizerId]);

  return { events, loading, error };
};
