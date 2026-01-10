import React from 'react';
import { Post } from '../../types';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  return (
    <div className="post-card">
      <h3>Post Card Component</h3>
      <p>Post ID: {post.id}</p>
      <button onClick={onUpdate} className="btn btn-secondary">
        Update
      </button>
    </div>
  );
};

export default PostCard;