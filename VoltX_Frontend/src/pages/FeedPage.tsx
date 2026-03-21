import React, { useEffect, useState } from 'react';
import PostCard from '../components/Post/PostCard';

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch('/api/posts/feed', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Feed fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Feed</h2>
      {loading ? (
        <p style={{ color: '#a0a0a0' }}>Loading...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#a0a0a0', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌊</div>
          <p>Your feed is empty. Follow some users or join events!</p>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
};

export default FeedPage;


// chore: dead fallback code removed
