import React from 'react';

interface CreateEventProps {
  onClose: () => void;
  onEventCreated: () => void;
}

const CreateEvent: React.FC<CreateEventProps> = ({ onClose, onEventCreated }) => {
  const handleSubmit = () => {
    // Simulate event creation
    onEventCreated();
  };

  return (
    <div className="create-event-modal">
      <div className="create-event-content">
        <div className="create-event-header">
          <h3>Create New Event</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="create-event-body">
          <input
            type="text"
            placeholder="Event title..."
            className="event-input"
          />
          <textarea
            placeholder="Event description..."
            className="event-textarea"
          />
          <input
            type="text"
            placeholder="Location..."
            className="event-input"
          />
        </div>

        <div className="create-event-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn btn-primary">
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;