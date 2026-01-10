import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import EventCard from '../components/Event/EventCard';
import CreateEvent from '../components/Event/CreateEvent';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Event } from '../types';
import './Events.css';

// Mock event service - will be replaced with real API
const mockEventService = {
  getEvents: async (): Promise<Event[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  }
};

const Events: React.FC = () => {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-events' | 'past'>('upcoming');

  const {
    data: events = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['events', activeTab],
    queryFn: mockEventService.getEvents,
  });

  const handleEventCreated = () => {
    refetch();
    setShowCreateEvent(false);
  };

  if (isLoading) {
    return (
      <div className="events-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-error">
        <h3>Failed to load events</h3>
        <p>Please try again later.</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="events">
      <div className="events-header">
        <h1>Events</h1>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="btn btn-primary create-event-btn"
        >
          Create Event
        </button>
      </div>

      <div className="events-tabs">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={activeTab === 'upcoming' ? 'tab active' : 'tab'}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('my-events')}
          className={activeTab === 'my-events' ? 'tab active' : 'tab'}
        >
          My Events
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={activeTab === 'past' ? 'tab active' : 'tab'}
        >
          Past Events
        </button>
      </div>

      {showCreateEvent && (
        <CreateEvent
          onClose={() => setShowCreateEvent(false)}
          onEventCreated={handleEventCreated}
        />
      )}

      <div className="events-container">
        {events.length === 0 ? (
          <div className="empty-events">
            <div className="empty-events-icon">📅</div>
            <h3>No events found</h3>
            <p>
              {activeTab === 'upcoming' && "No upcoming events at the moment."}
              {activeTab === 'my-events' && "You haven't created any events yet."}
              {activeTab === 'past' && "No past events to show."}
            </p>
            {activeTab === 'my-events' && (
              <button
                onClick={() => setShowCreateEvent(true)}
                className="btn btn-primary"
              >
                Create Your First Event
              </button>
            )}
          </div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onUpdate={refetch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;