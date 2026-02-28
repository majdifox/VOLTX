import React, { useState } from 'react';

interface Comment { id: number; author: { firstName: string; username: string }; content: string; createdAt: string; }
interface Props { postId: number; initialComments?: Comment[]; }

const CommentSection: React.FC<Props> = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments([...comments, c]);
        setText('');
      }
    } catch { }
  };

  return (
    <div style={{ marginTop: 14, borderTop: '1px solid #1a1a1a', paddingTop: 14 }}>
      {comments.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontSize: 13, flexShrink: 0 }}>{c.author.firstName[0]}</div>
          <div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{c.author.firstName} </span>
            <span style={{ color: '#e0e0e0', fontSize: 13 }}>{c.content}</span>
          </div>
        </div>
      ))}
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment..." style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13 }} />
        <button type="submit" style={{ background: '#00d4ff', color: '#000', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Post</button>
      </form>
    </div>
  );
};

export default CommentSection;
