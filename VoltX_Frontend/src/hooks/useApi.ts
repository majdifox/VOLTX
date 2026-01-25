import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../stores/toastStore';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const { success, error: showError } = useToast();

  const execute = useCallback(async <R = T>(
    apiCall: () => Promise<R>,
    options: ApiOptions = {}
  ): Promise<R | null> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operation completed successfully',
      onSuccess,
      onError
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      
      setState(prev => ({ 
        ...prev, 
        data: result as T, 
        loading: false, 
        error: null 
      }));

      if (showSuccessToast) {
        success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));

      if (showErrorToast) {
        showError(errorMessage);
      }

      if (onError) {
        onError(errorMessage);
      }

      return null;
    }
  }, [success, showError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Specialized hook for form submissions
export function useFormSubmit<T = any>() {
  const api = useApi<T>();

  const submitForm = useCallback(async (
    formData: any,
    apiCall: (data: any) => Promise<T>,
    options: ApiOptions = {}
  ) => {
    return api.execute(() => apiCall(formData), {
      showSuccessToast: true,
      successMessage: 'Form submitted successfully',
      ...options
    });
  }, [api]);

  return {
    ...api,
    submitForm
  };
}

// Hook for data fetching with automatic loading states
export function useFetch<T = any>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const api = useApi<T>();

  useEffect(() => {
    api.execute(fetchFn, { showErrorToast: true });
  }, dependencies);

  return api;
}
