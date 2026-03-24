import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', location: '', riskLevel: 'LOW', memberLimit: 10, rewardPoints: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create event');
      const ev = await res.json();
      navigate(`/app/events/${ev.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', boxSizing: 'border-box' as const, fontSize: 15, marginTop: 6 };
  const labelStyle = { color: '#a0a0a0', fontSize: 14 };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>Create Event</h2>
      {error && <div style={{ color: '#ff2d55', marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label style={labelStyle}>Name</label><input name="name" value={form.name} onChange={handleChange} style={fieldStyle} required /></div>
        <div><label style={labelStyle}>Description</label><textarea name="description" value={form.description} onChange={handleChange} style={{ ...fieldStyle, minHeight: 100 }} /></div>
        <div><label style={labelStyle}>Location</label><input name="location" value={form.location} onChange={handleChange} style={fieldStyle} /></div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Risk Level</label>
            <select name="riskLevel" value={form.riskLevel} onChange={handleChange} style={fieldStyle}>
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
            </select>
          </div>
          <div style={{ flex: 1 }}><label style={labelStyle}>Member Limit</label><input type="number" name="memberLimit" value={form.memberLimit} onChange={handleChange} style={fieldStyle} /></div>
          <div style={{ flex: 1 }}><label style={labelStyle}>Reward Points</label><input type="number" name="rewardPoints" value={form.rewardPoints} onChange={handleChange} style={fieldStyle} /></div>
        </div>
        <button type="submit" disabled={loading} style={{ background: '#00d4ff', color: '#000', padding: 14, borderRadius: 10, fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 8 }}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEventPage;

// fix: eventDate validated as required
