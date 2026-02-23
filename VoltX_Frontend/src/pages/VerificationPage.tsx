import React, { useState } from 'react';

const VerificationPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('NATIONAL_ID');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', docType);
    try {
      const res = await fetch('/api/users/me/verification', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (res.ok) setSuccess(true);
    } catch { }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>✅</div>
        <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 12 }}>Verification Submitted</h2>
        <p style={{ color: '#a0a0a0', lineHeight: 1.6 }}>Your verification request is under review. You'll be notified when it's processed.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>Identity Verification</h2>
      <p style={{ color: '#a0a0a0', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Submit a government-issued document to get verified and unlock additional features.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ color: '#a0a0a0', fontSize: 14 }}>Document Type</label>
          <select value={docType} onChange={e => setDocType(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', marginTop: 6 }}>
            <option value="NATIONAL_ID">National ID</option>
            <option value="PASSPORT">Passport</option>
            <option value="DRIVERS_LICENSE">Driver's License</option>
          </select>
        </div>
        <div>
          <label style={{ color: '#a0a0a0', fontSize: 14 }}>Upload Document</label>
          <input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} style={{ color: '#a0a0a0', marginTop: 8 }} required />
        </div>
        <button type="submit" disabled={submitting || !file} style={{ background: '#00d4ff', color: '#000', padding: 14, borderRadius: 10, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', marginTop: 8 }}>
          {submitting ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
};

export default VerificationPage;
