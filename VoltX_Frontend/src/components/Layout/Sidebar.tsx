import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'sidebar-link active' : 'sidebar-link';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Navigation</h3>
        <Link to="/" className={isActive('/')}>
          <span>🏠</span> Home Feed
        </Link>
        <Link to="/events" className={isActive('/events')}>
          <span>📅</span> Events
        </Link>
        <Link to={`/profile/${user?.username}`} className={isActive(`/profile/${user?.username}`)}>
          <span>👤</span> My Profile
        </Link>
      </div>

      <div className="sidebar-section">
        <h3>Stats</h3>
        <div className="stat-item">
          <span>⚡</span>
          <div>
            <div className="stat-label">Adrenaline Points</div>
            <div className="stat-value">{user?.adrenalinePoints || 0}</div>
          </div>
        </div>
        <div className="stat-item">
          <span>🎯</span>
          <div>
            <div className="stat-label">Level</div>
            <div className="stat-value">{user?.level || 1}</div>
          </div>
        </div>
        <div className="stat-item">
          <span>👥</span>
          <div>
            <div className="stat-label">Followers</div>
            <div className="stat-value">{user?.followersCount || 0}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Quick Actions</h3>
        <button className="btn btn-primary sidebar-action">
          Create Post
        </button>
        <button className="btn btn-secondary sidebar-action">
          Create Event
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;