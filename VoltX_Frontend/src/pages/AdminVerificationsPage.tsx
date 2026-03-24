import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

const AdminVerificationsPage: React.FC = () => {
  const [verifs, setVerifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getPendingVerifications().then(setVerifs).finally(() => setLoading(false));
  }, []);

  const review = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    await adminService.reviewVerification(id, status);
    setVerifs(verifs.filter(v => v.id !== id));
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 24 }}>Pending Verifications</h2>
      {loading ? <p style={{ color: '#a0a0a0' }}>Loading...</p> : verifs.length === 0 ? (
        <p style={{ color: '#a0a0a0' }}>No pending verifications.</p>
      ) : verifs.map(v => (
        <div key={v.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 14, padding: 20, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 600 }}>{v.user?.firstName} {v.user?.lastName}</div>
            <div style={{ color: '#a0a0a0', fontSize: 13 }}>{v.documentType} · {new Date(v.submittedAt).toLocaleDateString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => review(v.id, 'APPROVED')} style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid #00e676', color: '#00e676', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Approve</button>
            <button onClick={() => review(v.id, 'REJECTED')} style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid #ff2d55', color: '#ff2d55', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminVerificationsPage;

// fix(page): AdminVerificationsPage handles empty array from API
