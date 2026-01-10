import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-text">VoltX</span>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">Feed</Link>
          <Link to="/events" className="nav-link">Events</Link>
          <Link to={`/profile/${user?.username}`} className="nav-link">Profile</Link>
        </nav>

        <div className="header-actions">
          <div className="user-info">
            <img
              src={user?.profilePicture || '/default-avatar.png'}
              alt={user?.username}
              className="user-avatar"
            />
            <span className="username">{user?.username}</span>
            <span className="level">Lv. {user?.level}</span>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;