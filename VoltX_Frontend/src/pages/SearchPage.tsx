import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const users = await searchService.searchUsers(query);
      setResults(users);
    } catch { } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 20 }}>Search</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users or events..." style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 15 }} />
        <button type="submit" style={{ background: '#00d4ff', color: '#000', padding: '12px 20px', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Search</button>
      </form>
      {loading ? <p style={{ color: '#a0a0a0' }}>Searching...</p> : results.map(u => (
        <div key={u.id} onClick={() => navigate(`/app/profile/${u.id}`)} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000', fontSize: 18 }}>{u.firstName?.[0]}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
            <div style={{ color: '#a0a0a0', fontSize: 13 }}>@{u.username} · Level {u.level}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchPage;
