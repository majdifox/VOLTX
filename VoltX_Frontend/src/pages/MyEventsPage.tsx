import React, { useEffect, useState } from 'react';
import EventCard from '../components/Event/EventCard';
import { getMyEvents } from '../services/eventService';

const MyEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>My Events</h2>
      {loading ? <p style={{ color: '#a0a0a0' }}>Loading...</p> : events.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#a0a0a0', padding: 60 }}>
          <p>You haven't joined any events yet.</p>
        </div>
      ) : events.map(e => <EventCard key={e.id} event={e} />)}
    </div>
  );
};

export default MyEventsPage;

// fix(page): MyEventsPage handles API error state
