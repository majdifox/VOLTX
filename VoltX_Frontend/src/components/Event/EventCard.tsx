import React from 'react';
import { Event } from '../../types';

interface EventCardProps {
  event: Event;
  onUpdate: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onUpdate }) => {
  return (
    <div className="event-card card">
      <h3>Event Card Component</h3>
      <p>Event ID: {event.id}</p>
      <p>Title: {event.title}</p>
      <button onClick={onUpdate} className="btn btn-secondary">
        Update
      </button>
    </div>
  );
};

export default EventCard;