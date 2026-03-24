import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return { user, isAuthenticated, setAuth, signOut };
};

// chore: add index.ts barrel for hooks directory

// chore: add TypeScript strict null checks to critical hooks
