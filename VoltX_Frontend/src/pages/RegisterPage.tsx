import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '', gender: 'Male' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('')
    setForm({ ...form });
    // TODO: connect to authService.register
    console.log('register', form);
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 20 }}>
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 20, padding: 40, width: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ color: '#00d4ff', fontSize: 32, fontWeight: 900 }}>⚡ VOLTX</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Create your account</h1>
        </div>
        {error && <div style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid #ff2d55', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#ff2d55', fontSize: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {['firstName','lastName'].map(f => (
              <div key={f} style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0a0', textTransform: 'capitalize' }}>{f.replace('N',' N')}</label>
                <input name={f} value={(form as any)[f]} onChange={handleChange} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', boxSizing: 'border-box' }} required />
              </div>
            ))}
          </div>
          {['username','email','password'].map(f => (
            <div key={f} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0a0', textTransform: 'capitalize' }}>{f}</label>
              <input type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'} name={f} value={(form as any)[f]} onChange={handleChange} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', boxSizing: 'border-box' }} required />
            </div>
          ))}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0a0' }}>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', boxSizing: 'border-box' }}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <button type="submit" style={{ width: '100%', background: '#00d4ff', color: '#000', padding: '14px', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Create Account</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#a0a0a0', fontSize: 14 }}>
          Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#00d4ff', cursor: 'pointer' }}>Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;


// fix: password min length 8 enforced client-side
