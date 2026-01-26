import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options;

  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error accessing localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((prevValue: T) => T)) => {
    try {
      setStoredValue(prevValue => {
        const newValue = typeof value === 'function'
          ? (value as (prevValue: T) => T)(prevValue)
          : value;

        window.localStorage.setItem(key, serialize(newValue));
        return newValue;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for external changes to localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          console.error(`Error deserializing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return [storedValue, setValue, removeValue];
}

// Hook for managing user preferences
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  sidebarCollapsed: boolean;
  compactMode: boolean;
}

export function useUserPreferences() {
  const [preferences, setPreferences, removePreferences] = useLocalStorage<UserPreferences>(
    'voltx_user_preferences',
    {
      theme: 'light',
      language: 'en',
      notifications: true,
      sidebarCollapsed: false,
      compactMode: false
    }
  );

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences: removePreferences
  };
}

// Hook for managing search/filter state
interface SearchState {
  query: string;
  filters: Record<string, any>;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export function useSearchState(
  storageKey: string,
  initialState: Partial<SearchState> = {}
) {
  const defaultState: SearchState = {
    query: '',
    filters: {},
    sortBy: 'name',
    sortDirection: 'asc',
    page: 0,
    pageSize: 20,
    ...initialState
  };

  const [searchState, setSearchState] = useLocalStorage(storageKey, defaultState);

  const updateSearch = useCallback((updates: Partial<SearchState>) => {
    setSearchState(prev => ({
      ...prev,
      ...updates,
      // Reset page when search changes
      ...(updates.query !== undefined || updates.filters !== undefined ? { page: 0 } : {})
    }));
  }, [setSearchState]);

  const resetSearch = useCallback(() => {
    setSearchState(defaultState);
  }, [setSearchState, defaultState]);

  return {
    searchState,
    updateSearch,
    resetSearch
  };
}