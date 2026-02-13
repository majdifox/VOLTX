import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Performance monitoring utilities for VoltX frontend
 */

// Performance measurement utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements = new Map<string, number[]>();
  private observers = new Map<string, PerformanceObserver>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  startTiming(name: string): void {
    performance.mark(`${name}-start`);
  }

  /**
   * End timing and record measurement
   */
  endTiming(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const entries = performance.getEntriesByName(name, 'measure');
    if (entries.length > 0) {
      const entry = entries[entries.length - 1];
      const duration = entry.duration;

      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      this.measurements.get(name)!.push(duration);

      // Keep only last 100 measurements to prevent memory leaks
      if (this.measurements.get(name)!.length > 100) {
        this.measurements.get(name)!.shift();
      }

      return duration;
    }
    return 0;
  }

  /**
   * Get timing statistics for an operation
   */
  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);

    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: sum / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * Monitor Core Web Vitals
   */
  observeWebVitals(callback: (metric: any) => void): void {
    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', callback);

    // First Input Delay
    this.observeMetric('first-input', callback);

    // Cumulative Layout Shift
    this.observeMetric('layout-shift', callback);
  }

  private observeMetric(type: string, callback: (metric: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback({
            name: entry.name || type,
            value: entry.startTime || (entry as any).value,
            rating: this.getRating(type, entry.startTime || (entry as any).value)
          });
        }
      });

      observer.observe({ entryTypes: [type] });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Performance observer not supported for ${type}:`, error);
    }
  }

  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      'largest-contentful-paint': { good: 2500, poor: 4000 },
      'first-input': { good: 100, poor: 300 },
      'layout-shift': { good: 0.1, poor: 0.25 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Clean up observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * Hook for performance timing
 */
export const usePerformanceTiming = (name: string) => {
  const monitor = PerformanceMonitor.getInstance();

  const startTiming = useCallback(() => {
    monitor.startTiming(name);
  }, [monitor, name]);

  const endTiming = useCallback(() => {
    return monitor.endTiming(name);
  }, [monitor, name]);

  const getStats = useCallback(() => {
    return monitor.getStats(name);
  }, [monitor, name]);

  return { startTiming, endTiming, getStats };
};

/**
 * Hook for debouncing values
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  const lastRanRef = useRef<number>(0);

  return useCallback((...args: any[]) => {
    const now = Date.now();
    if (now - lastRanRef.current >= delay) {
      func(...args);
      lastRanRef.current = now;
    }
  }, [func, delay]) as T;
};

/**
 * Hook for intersection observer (lazy loading)
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit
) => {
  const [ref, setRef] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return { ref: setRef, isIntersecting };
};

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    };
  }
  return null;
};

/**
 * Bundle size analyzer
 */
export const getBundleInfo = () => {
  const scripts = Array.from(document.scripts);
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  return {
    scriptCount: scripts.length,
    stylesheetCount: stylesheets.length,
    scripts: scripts.map(script => ({
      src: script.src,
      size: script.src ? 'unknown' : script.textContent?.length || 0
    })),
    stylesheets: stylesheets.map(link => ({
      href: (link as HTMLLinkElement).href
    }))
  };
};

/**
 * Network information
 */
export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};

/**
 * Performance budget checker
 */
export const checkPerformanceBudget = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (!navigation) return null;

  const metrics = {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: 0,
    firstContentfulPaint: 0
  };

  // Get paint timings
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach(entry => {
    if (entry.name === 'first-paint') {
      metrics.firstPaint = entry.startTime;
    } else if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = entry.startTime;
    }
  });

  // Performance budget thresholds (in milliseconds)
  const budget = {
    domContentLoaded: 1500,
    loadComplete: 3000,
    firstPaint: 1000,
    firstContentfulPaint: 1500
  };

  const results = Object.entries(metrics).map(([key, value]) => {
    const threshold = budget[key as keyof typeof budget];
    return {
      metric: key,
      value,
      threshold,
      passed: value <= threshold,
      severity: value > threshold * 1.5 ? 'critical' : value > threshold ? 'warning' : 'good'
    };
  });

  return {
    metrics,
    budget,
    results,
    overallPassed: results.every(r => r.passed)
  };
};

/**
 * Component performance wrapper
 */
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const monitor = PerformanceMonitor.getInstance();

    useEffect(() => {
      monitor.startTiming(`${componentName}-mount`);
      return () => {
        monitor.endTiming(`${componentName}-mount`);
      };
    }, [monitor]);

    useEffect(() => {
      monitor.startTiming(`${componentName}-render`);
      return () => {
        monitor.endTiming(`${componentName}-render`);
      };
    });

    return <Component {...props} />;
  };
};