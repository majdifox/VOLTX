import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PostCard from '../components/Post/PostCard';
import CreatePost from '../components/Post/CreatePost';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Post } from '../types';
import './Home.css';

// Mock post service - will be replaced with real API
const mockPostService = {
  getPosts: async (): Promise<Post[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  }
};

const Home: React.FC = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);

  const {
    data: posts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['posts'],
    queryFn: mockPostService.getPosts,
  });

  const handlePostCreated = () => {
    refetch();
    setShowCreatePost(false);
  };

  if (isLoading) {
    return (
      <div className="home-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <h3>Failed to load posts</h3>
        <p>Please try again later.</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1>Feed</h1>
        <button
          onClick={() => setShowCreatePost(true)}
          className="btn btn-primary create-post-btn"
        >
          Create Post
        </button>
      </div>

      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <div className="empty-feed-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Be the first to share your adrenaline-fueled adventure!</p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="btn btn-primary"
            >
              Create First Post
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={refetch}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;