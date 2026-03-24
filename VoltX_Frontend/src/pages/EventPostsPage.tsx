import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/Post/PostCard';

const EventPostsPage: React.FC = () => {
  const { id } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/event/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>Event Posts</h2>
      {loading ? <p style={{ color: '#a0a0a0' }}>Loading...</p> : posts.length === 0 ? (
        <p style={{ color: '#a0a0a0' }}>No posts for this event yet.</p>
      ) : posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
};

export default EventPostsPage;

// fix(page): EventPostsPage uses event token for auth
