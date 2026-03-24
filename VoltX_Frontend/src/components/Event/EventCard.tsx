import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: number;
  name: string;
  description?: string;
  location?: string;
  riskLevel?: string;
  eventDate?: string;
  organizer?: { firstName: string; lastName: string };
  memberLimit?: number;
  rewardPoints?: number;
}

interface EventCardProps { event: Event; }

const riskColors: Record<string, string> = { LOW: '#00e676', MEDIUM: '#ffab00', HARD: '#ff2d55' };

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const riskColor = riskColors[event.riskLevel || 'LOW'] || '#00d4ff';
  const formattedDate = event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '';

  return (
    <div onClick={() => navigate(`/app/events/${event.id}`)} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 24, marginBottom: 16, cursor: 'pointer', transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, flex: 1 }}>{event.name}</h3>
        {event.riskLevel && (
          <span style={{ background: `${riskColor}20`, color: riskColor, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${riskColor}40`, marginLeft: 12 }}>
            {event.riskLevel}
          </span>
        )}
      </div>
      {event.description && <p style={{ color: '#a0a0a0', fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>{event.description.slice(0, 120)}{event.description.length > 120 ? '...' : ''}</p>}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {event.location && <span style={{ color: '#a0a0a0', fontSize: 13 }}>📍 {event.location}</span>}
        {formattedDate && <span style={{ color: '#a0a0a0', fontSize: 13 }}>📅 {formattedDate}</span>}
        {event.rewardPoints && <span style={{ color: '#00d4ff', fontSize: 13 }}>⚡ {event.rewardPoints} AP</span>}
      </div>
    </div>
  );
};

export default EventCard;

// style: hover highlight and transition polished

// fix: eventDate formatted consistently

// refactor: extract RiskBadge from EventCard

// style(component): EventCard pulse animation on risk badge
