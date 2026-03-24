import React, { useEffect, useState } from 'react';
import EventCard from '../components/Event/EventCard';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => setEvents(Array.isArray(d) ? d : d?.content || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>Events</h2>
      </div>
      {loading ? <p style={{ color: '#a0a0a0' }}>Loading events...</p> : events.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#a0a0a0', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <p>No events available yet.</p>
        </div>
      ) : events.map(e => <EventCard key={e.id} event={e} />)}
    </div>
  );
};

export default EventsPage;


// style(page): improve empty state illustration for EventsPage
