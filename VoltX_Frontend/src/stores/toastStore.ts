import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  // Convenience methods
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Convenience methods
  showSuccess: (message, duration) => {
    get().addToast({ message, type: 'success', duration });
  },

  showError: (message, duration) => {
    get().addToast({ message, type: 'error', duration });
  },

  showWarning: (message, duration) => {
    get().addToast({ message, type: 'warning', duration });
  },

  showInfo: (message, duration) => {
    get().addToast({ message, type: 'info', duration });
  }
}));

// Custom hook for easier usage
export const useToast = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToastStore();
  
  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo
  };
};
