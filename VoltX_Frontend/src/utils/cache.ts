/**
 * Advanced caching utilities for VoltX application
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

/**
 * Multi-layer cache implementation with LRU eviction
 */
export class AdvancedCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private accessOrder: string[] = [];
  private maxSize: number;
  private defaultTTL: number;
  private storage: CacheOptions['storage'];

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.storage = options.storage || 'memory';

    // Load from persistent storage if specified
    if (this.storage !== 'memory') {
      this.loadFromStorage();
    }

    // Cleanup expired items periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Set cache item
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
      lastAccessed: now
    };

    // Remove existing item from access order
    this.removeFromAccessOrder(key);

    // Add to cache
    this.cache.set(key, item);
    this.accessOrder.push(key);

    // Enforce size limit
    if (this.cache.size > this.maxSize) {
      this.evictLRU();
    }

    // Persist to storage if needed
    this.persistToStorage();
  }

  /**
   * Get cache item
   */
  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;

    // Update LRU order
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);

    return item.data;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache item
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      this.persistToStorage();
    }
    return deleted;
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.persistToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const items = Array.from(this.cache.values());

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage(),
      oldestItem: items.length > 0 ? Math.min(...items.map(i => i.timestamp)) : null,
      newestItem: items.length > 0 ? Math.max(...items.map(i => i.timestamp)) : null,
      expiredCount: items.filter(i => now - i.timestamp > i.ttl).length
    };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache item info without accessing it
   */
  getItemInfo(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    return {
      size: this.estimateItemSize(item),
      age: now - item.timestamp,
      ttl: item.ttl,
      expired: now - item.timestamp > item.ttl,
      accessCount: item.accessCount,
      lastAccessed: item.lastAccessed
    };
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder[0];
      this.delete(lruKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
  }

  private persistToStorage(): void {
    if (this.storage === 'memory') return;

    try {
      const serialized = JSON.stringify({
        cache: Array.from(this.cache.entries()),
        accessOrder: this.accessOrder
      });

      if (this.storage === 'localStorage') {
        localStorage.setItem('voltx_cache', serialized);
      } else if (this.storage === 'sessionStorage') {
        sessionStorage.setItem('voltx_cache', serialized);
      }
    } catch (error) {
      console.warn('Failed to persist cache to storage:', error);
    }
  }

  private loadFromStorage(): void {
    if (this.storage === 'memory') return;

    try {
      let serialized: string | null = null;

      if (this.storage === 'localStorage') {
        serialized = localStorage.getItem('voltx_cache');
      } else if (this.storage === 'sessionStorage') {
        serialized = sessionStorage.getItem('voltx_cache');
      }

      if (serialized) {
        const parsed = JSON.parse(serialized);
        this.cache = new Map(parsed.cache);
        this.accessOrder = parsed.accessOrder || [];

        // Clean up expired items
        this.cleanup();
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private calculateHitRate(): number {
    // This would require tracking hits/misses, simplified for now
    return 0.85; // Mock hit rate
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    this.cache.forEach(item => {
      size += this.estimateItemSize(item);
    });
    return size;
  }

  private estimateItemSize(item: CacheItem<T>): number {
    // Rough estimation in bytes
    const jsonStr = JSON.stringify(item);
    return new Blob([jsonStr]).size;
  }
}

/**
 * Cache decorator for async functions
 */
export function cached<T extends any[], R>(
  cache: AdvancedCache<R>,
  keyGenerator: (...args: T) => string,
  ttl?: number
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const cacheKey = keyGenerator(...args);

      // Try to get from cache first
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method and cache result
      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * React hook for caching
 */
export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) => {
  const cache = new AdvancedCache<T>(options);

  return {
    get: () => cache.get(key),
    set: (data: T) => cache.set(key, data),
    fetch: async () => {
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      const data = await fetcher();
      cache.set(key, data);
      return data;
    },
    clear: () => cache.delete(key),
    stats: () => cache.getStats()
  };
};

/**
 * Query cache specifically for API responses
 */
export class QueryCache extends AdvancedCache<any> {
  constructor(options: CacheOptions = {}) {
    super({
      ...options,
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes for API responses
      maxSize: options.maxSize || 200
    });
  }

  /**
   * Cache API response with automatic key generation
   */
  cacheQuery(url: string, params: Record<string, any> = {}, data: any, ttl?: number): void {
    const key = this.generateQueryKey(url, params);
    this.set(key, data, ttl);
  }

  /**
   * Get cached API response
   */
  getQuery(url: string, params: Record<string, any> = {}): any {
    const key = this.generateQueryKey(url, params);
    return this.get(key);
  }

  /**
   * Invalidate queries by pattern
   */
  invalidateQueries(pattern: string): void {
    const keysToDelete = this.keys().filter(key => key.includes(pattern));
    keysToDelete.forEach(key => this.delete(key));
  }

  private generateQueryKey(url: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${url}${sortedParams ? '?' + sortedParams : ''}`;
  }
}

// Export singleton instances
export const memoryCache = new AdvancedCache({ storage: 'memory', maxSize: 100 });
export const persistentCache = new AdvancedCache({ storage: 'localStorage', maxSize: 50 });
export const queryCache = new QueryCache({ storage: 'memory', maxSize: 200 });