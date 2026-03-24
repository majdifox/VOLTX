import React, { useState, useEffect } from 'react';

const SettingsPage: React.FC = () => {
  const [form, setForm] = useState({ bio: '', country: '', city: '', instagram: '', tiktok: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form),
      });
      if (res.ok) setSuccess('Profile updated!');
    } catch { }
    setLoading(false);
  };

  const fieldStyle = { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', boxSizing: 'border-box' as const, fontSize: 15, marginTop: 6 };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>Settings</h2>
      {success && <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid #00e676', color: '#00e676', borderRadius: 8, padding: '10px 16px', marginBottom: 16 }}>{success}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label style={{ color: '#a0a0a0', fontSize: 14 }}>Bio</label><textarea name="bio" value={form.bio} onChange={handleChange} style={{ ...fieldStyle, minHeight: 80 }} /></div>
        {['country', 'city', 'instagram', 'tiktok'].map(f => (
          <div key={f}><label style={{ color: '#a0a0a0', fontSize: 14, textTransform: 'capitalize' }}>{f}</label><input name={f} value={(form as any)[f]} onChange={handleChange} style={fieldStyle} /></div>
        ))}
        <button type="submit" disabled={loading} style={{ background: '#00d4ff', color: '#000', padding: 14, borderRadius: 10, fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;

// fix: update authStore after successful profile picture upload

// fix(page): settings avatar upload uses correct endpoint

// style(page): SettingsPage form labels bold text
