import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('STANDARD');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('postType', postType);
      if (file) formData.append('file', file);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (res.ok) navigate('/app/feed');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>Create Post</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ color: '#a0a0a0', fontSize: 14 }}>Caption</label>
          <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="What's the adrenaline rush today?" style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '14px 16px', color: '#fff', minHeight: 120, fontSize: 15, marginTop: 6, boxSizing: 'border-box', resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ color: '#a0a0a0', fontSize: 14 }}>Post Type</label>
          <select value={postType} onChange={e => setPostType(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', marginTop: 6 }}>
            <option value="STANDARD">Standard</option>
            <option value="EVENT_RECAP">Event Recap</option>
          </select>
        </div>
        <div>
          <label style={{ color: '#a0a0a0', fontSize: 14 }}>Media</label>
          <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ color: '#a0a0a0', marginTop: 6 }} />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#00d4ff', color: '#000', padding: 14, borderRadius: 10, fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 8 }}>
          {loading ? 'Posting...' : 'Share Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;

// style(page): CreatePostPage dark textarea focus ring
