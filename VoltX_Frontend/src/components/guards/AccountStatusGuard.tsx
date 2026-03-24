import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const AccountStatusGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.accountStatus?.toUpperCase() === 'BANNED') {
      navigate('/banned', { replace: true });
    }
  }, [user]);

  return <>{children}</>;
};

export default AccountStatusGuard;

// fix(guard): AccountStatusGuard uses useEffect dependency correctly
