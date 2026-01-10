import React from 'react';

interface CreatePostProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPostCreated }) => {
  const handleSubmit = () => {
    // Simulate post creation
    onPostCreated();
  };

  return (
    <div className="create-post-modal">
      <div className="create-post-content">
        <div className="create-post-header">
          <h3>Create New Post</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="create-post-body">
          <textarea
            placeholder="Share your adrenaline-fueled adventure..."
            className="post-textarea"
          />
        </div>

        <div className="create-post-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn btn-primary">
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;