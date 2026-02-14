// Push notification service for browser notifications
export interface PushNotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface PushNotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
  data?: any;
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  timestamp?: number;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private permission: NotificationPermission = 'default';
  private registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

  private constructor() {
    this.updatePermission();
    this.initializeServiceWorker();
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current permission status
  getPermission(): PushNotificationPermission {
    this.updatePermission();
    return {
      granted: this.permission === 'granted',
      denied: this.permission === 'denied',
      default: this.permission === 'default'
    };
  }

  private updatePermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  // Request permission for notifications
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Push notification permission has been denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Initialize service worker for push notifications
  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    this.registrationPromise = this.registerServiceWorker();
  }

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  // Show a local notification
  async showNotification(options: PushNotificationOptions): Promise<Notification | null> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/notification-icon.png',
        badge: options.badge || '/icons/badge-icon.png',
        image: options.image,
        tag: options.tag,
        renotify: options.renotify || false,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
        actions: options.actions,
        data: options.data,
        dir: options.dir || 'auto',
        lang: options.lang || 'en',
        timestamp: options.timestamp || Date.now()
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        if (options.data?.url) {
          window.open(options.data.url, '_blank');
        }

        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Show notification through service worker (for background notifications)
  async showServiceWorkerNotification(options: PushNotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return;
    }

    const registration = await this.registrationPromise;
    if (!registration) {
      console.error('Service Worker not available');
      return;
    }

    try {
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/notification-icon.png',
        badge: options.badge || '/icons/badge-icon.png',
        image: options.image,
        tag: options.tag,
        renotify: options.renotify || false,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
        actions: options.actions || [],
        data: options.data,
        timestamp: options.timestamp || Date.now()
      });
    } catch (error) {
      console.error('Error showing service worker notification:', error);
    }
  }

  // Subscribe to push notifications (requires VAPID keys)
  async subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return null;
    }

    const registration = await this.registrationPromise;
    if (!registration) {
      console.error('Service Worker not available for push subscription');
      return null;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    const registration = await this.registrationPromise;
    if (!registration) {
      return false;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription cancelled');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Get existing push subscription
  async getPushSubscription(): Promise<PushSubscription | null> {
    const registration = await this.registrationPromise;
    if (!registration) {
      return null;
    }

    try {
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting push subscription:', error);
      return null;
    }
  }

  // Helper function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Close all notifications with a specific tag
  async closeNotificationsByTag(tag: string): Promise<void> {
    const registration = await this.registrationPromise;
    if (!registration) {
      return;
    }

    try {
      const notifications = await registration.getNotifications({ tag });
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('Error closing notifications:', error);
    }
  }

  // Close all notifications
  async closeAllNotifications(): Promise<void> {
    const registration = await this.registrationPromise;
    if (!registration) {
      return;
    }

    try {
      const notifications = await registration.getNotifications();
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('Error closing all notifications:', error);
    }
  }
}

// React hook for using push notifications
export function usePushNotifications() {
  const service = PushNotificationService.getInstance();

  return {
    isSupported: service.isSupported(),
    getPermission: () => service.getPermission(),
    requestPermission: () => service.requestPermission(),
    showNotification: (options: PushNotificationOptions) => service.showNotification(options),
    showServiceWorkerNotification: (options: PushNotificationOptions) =>
      service.showServiceWorkerNotification(options),
    subscribeToPush: (vapidKey: string) => service.subscribeToPush(vapidKey),
    unsubscribeFromPush: () => service.unsubscribeFromPush(),
    getPushSubscription: () => service.getPushSubscription(),
    closeNotificationsByTag: (tag: string) => service.closeNotificationsByTag(tag),
    closeAllNotifications: () => service.closeAllNotifications()
  };
}

// Notification quota and frequency manager
export class NotificationQuotaManager {
  private static instance: NotificationQuotaManager;
  private notifications: Map<string, number[]> = new Map();
  private readonly maxPerHour = 10;
  private readonly maxPerDay = 50;

  static getInstance(): NotificationQuotaManager {
    if (!NotificationQuotaManager.instance) {
      NotificationQuotaManager.instance = new NotificationQuotaManager();
    }
    return NotificationQuotaManager.instance;
  }

  canSendNotification(userId: string): boolean {
    const now = Date.now();
    const userNotifications = this.notifications.get(userId) || [];

    // Clean old notifications (older than 24 hours)
    const dayAgo = now - (24 * 60 * 60 * 1000);
    const recentNotifications = userNotifications.filter(timestamp => timestamp > dayAgo);

    // Check hourly limit
    const hourAgo = now - (60 * 60 * 1000);
    const hourlyCount = recentNotifications.filter(timestamp => timestamp > hourAgo).length;

    if (hourlyCount >= this.maxPerHour) {
      return false;
    }

    // Check daily limit
    if (recentNotifications.length >= this.maxPerDay) {
      return false;
    }

    return true;
  }

  recordNotification(userId: string): void {
    const now = Date.now();
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.push(now);

    // Keep only recent notifications
    const dayAgo = now - (24 * 60 * 60 * 1000);
    const recentNotifications = userNotifications.filter(timestamp => timestamp > dayAgo);

    this.notifications.set(userId, recentNotifications);
  }

  getRemainingQuota(userId: string): { hourly: number; daily: number } {
    const now = Date.now();
    const userNotifications = this.notifications.get(userId) || [];

    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);

    const recentNotifications = userNotifications.filter(timestamp => timestamp > dayAgo);
    const hourlyCount = recentNotifications.filter(timestamp => timestamp > hourAgo).length;

    return {
      hourly: Math.max(0, this.maxPerHour - hourlyCount),
      daily: Math.max(0, this.maxPerDay - recentNotifications.length)
    };
  }
}