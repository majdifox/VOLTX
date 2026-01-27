// Browser and device detection utilities
export const browserUtils = {
  // Get browser name
  getBrowserName: (): string => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else if (userAgent.includes('Edg')) {
      return 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
    }

    return 'Unknown';
  },

  // Get operating system
  getOperatingSystem: (): string => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Windows NT')) {
      return 'Windows';
    } else if (userAgent.includes('Mac OS X')) {
      return 'macOS';
    } else if (userAgent.includes('Linux')) {
      return 'Linux';
    } else if (userAgent.includes('Android')) {
      return 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'iOS';
    }

    return 'Unknown';
  },

  // Check if mobile device
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if tablet
  isTablet: (): boolean => {
    return /iPad|Android(?=.*Tablet)|Windows NT.*ARM|Tablet/i.test(navigator.userAgent);
  },

  // Check if desktop
  isDesktop: (): boolean => {
    return !browserUtils.isMobile() && !browserUtils.isTablet();
  },

  // Get screen size category
  getScreenSize: (): 'small' | 'medium' | 'large' | 'xlarge' => {
    const width = window.innerWidth;

    if (width < 640) return 'small';     // sm
    if (width < 1024) return 'medium';   // md
    if (width < 1280) return 'large';    // lg
    return 'xlarge';                     // xl
  },

  // Check for touch support
  isTouchDevice: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Check for online status
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  // Get device pixel ratio
  getPixelRatio: (): number => {
    return window.devicePixelRatio || 1;
  },

  // Check for dark mode preference
  prefersDarkMode: (): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  // Check for reduced motion preference
  prefersReducedMotion: (): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get browser language
  getBrowserLanguage: (): string => {
    return navigator.language || 'en-US';
  },

  // Get timezone
  getTimezone: (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  // Get device info object
  getDeviceInfo: () => ({
    browser: browserUtils.getBrowserName(),
    os: browserUtils.getOperatingSystem(),
    isMobile: browserUtils.isMobile(),
    isTablet: browserUtils.isTablet(),
    isDesktop: browserUtils.isDesktop(),
    screenSize: browserUtils.getScreenSize(),
    isTouchDevice: browserUtils.isTouchDevice(),
    isOnline: browserUtils.isOnline(),
    pixelRatio: browserUtils.getPixelRatio(),
    prefersDarkMode: browserUtils.prefersDarkMode(),
    prefersReducedMotion: browserUtils.prefersReducedMotion(),
    language: browserUtils.getBrowserLanguage(),
    timezone: browserUtils.getTimezone(),
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  })
};

// Storage utilities
export const storageUtils = {
  // Check if storage is available
  isStorageAvailable: (type: 'localStorage' | 'sessionStorage'): boolean => {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Safe localStorage operations
  localStorage: {
    get: (key: string, defaultValue: any = null): any => {
      if (!storageUtils.isStorageAvailable('localStorage')) return defaultValue;

      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },

    set: (key: string, value: any): boolean => {
      if (!storageUtils.isStorageAvailable('localStorage')) return false;

      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove: (key: string): boolean => {
      if (!storageUtils.isStorageAvailable('localStorage')) return false;

      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },

    clear: (): boolean => {
      if (!storageUtils.isStorageAvailable('localStorage')) return false;

      try {
        localStorage.clear();
        return true;
      } catch {
        return false;
      }
    }
  },

  // Safe sessionStorage operations
  sessionStorage: {
    get: (key: string, defaultValue: any = null): any => {
      if (!storageUtils.isStorageAvailable('sessionStorage')) return defaultValue;

      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },

    set: (key: string, value: any): boolean => {
      if (!storageUtils.isStorageAvailable('sessionStorage')) return false;

      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove: (key: string): boolean => {
      if (!storageUtils.isStorageAvailable('sessionStorage')) return false;

      try {
        sessionStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },

    clear: (): boolean => {
      if (!storageUtils.isStorageAvailable('sessionStorage')) return false;

      try {
        sessionStorage.clear();
        return true;
      } catch {
        return false;
      }
    }
  }
};