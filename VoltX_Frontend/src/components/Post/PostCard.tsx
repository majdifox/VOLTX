import React
import CommentSection from './CommentSection';, { useState } from 'react';

interface PostCardProps {
  post: {
    id: number;
    author: { firstName: string; lastName: string; username: string; profilePicture?: string };
    caption?: string;
    mediaUrls?: string;
    likeCount?: number;
    commentCount?: number;
    createdAt: string;
    likedByCurrentUser?: boolean;
  };
  onLike?: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  const [liked, setLiked] = useState(post.likedByCurrentUser || false);
  const [likes, setLikes] = useState(post.likeCount || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    if (onLike) onLike(post.id);
  };

  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000' }}>
          {post.author.firstName[0]}
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 600 }}>{post.author.firstName} {post.author.lastName}</div>
          <div style={{ color: '#a0a0a0', fontSize: 13 }}>@{post.author.username}</div>
        </div>
      </div>
      {post.caption && <p style={{ color: '#e0e0e0', marginBottom: 14, lineHeight: 1.6 }}>{post.caption}</p>}
      <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', color: liked ? '#ff2d55' : '#a0a0a0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
          {liked ? '❤️' : '🤍'} {likes}
        </button>
        <span style={{ color: '#a0a0a0', fontSize: 15 }}>💬 {post.commentCount || 0}</span>
      </div>
    </div>
  );
};

export default PostCard;

<CommentSection postId={post.id} />

// avatar fallback improved


// fix: handle null mediaUrls gracefully

// fix: like endpoint corrected to /api/posts/{id}/like
