-- Create database schema for VoltX
-- This is a reference schema - actual tables will be created by JPA

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    birthday DATE,
    profile_picture VARCHAR(500),
    banner_picture VARCHAR(500),
    country VARCHAR(50),
    country_flag VARCHAR(10),
    city VARCHAR(50),
    phone_number VARCHAR(20),
    bio TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'EXPLORER',
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    verified BOOLEAN DEFAULT FALSE,
    adrenaline_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    suspension_count INTEGER DEFAULT 0,
    suspension_start_at TIMESTAMP,
    suspension_end_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    media_url VARCHAR(500),
    location VARCHAR(100),
    type VARCHAR(20) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    risk_level VARCHAR(20) NOT NULL,
    organizer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    moderation_status VARCHAR(20) DEFAULT 'PENDING_REVIEW',
    lifecycle_status VARCHAR(20) DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);