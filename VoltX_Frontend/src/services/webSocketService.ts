import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../stores/authStore';
import { errorHandler } from '../utils';

export interface NotificationMessage {
  type: string;
  message?: string;
  username?: string;
  timestamp: string;
  [key: string]: any;
}

type MessageHandler = (message: NotificationMessage) => void;

/**
 * WebSocket service for real-time communication with VoltX backend
 * Handles connections, subscriptions, and message routing
 */
class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private subscriptions = new Map<string, StompSubscription>();
  private messageHandlers = new Map<string, MessageHandler[]>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Initialize WebSocket connection
   */
  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const { token } = useAuthStore.getState();
        if (!token) {
          reject(new Error('No authentication token available'));
          return;
        }

        // Create STOMP client with SockJS fallback
        this.client = new Client({
          webSocketFactory: () => new SockJS('/ws'),
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },
          debug: (str) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[WebSocket Debug]', str);
            }
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        // Connection success handler
        this.client.onConnect = (frame) => {
          console.log('[WebSocket] Connected:', frame);
          this.connected = true;
          this.reconnectAttempts = 0;
          this.setupDefaultSubscriptions();
          resolve(true);
        };

        // Connection error handler
        this.client.onStompError = (frame) => {
          console.error('[WebSocket] STOMP Error:', frame);
          this.connected = false;
          errorHandler.handleError(new Error(`WebSocket STOMP Error: ${frame.headers['message']}`), {
            component: 'WebSocketService',
            action: 'Connection Error'
          });
          reject(new Error(frame.headers['message']));
        };

        // Web socket error handler
        this.client.onWebSocketError = (error) => {
          console.error('[WebSocket] WebSocket Error:', error);
          this.connected = false;
          this.handleReconnection();
        };

        // Disconnection handler
        this.client.onDisconnect = () => {
          console.log('[WebSocket] Disconnected');
          this.connected = false;
          this.subscriptions.clear();
        };

        // Activate the connection
        this.client.activate();

      } catch (error) {
        errorHandler.handleError(error, {
          component: 'WebSocketService',
          action: 'Initialize Connection'
        });
        reject(error);
      }
    });
  }

  /**
   * Set up default subscriptions for authenticated user
   */
  private setupDefaultSubscriptions(): void {
    const { user } = useAuthStore.getState();
    if (!user?.username) return;

    // Subscribe to personal notifications
    this.subscribe('/user/queue/notifications', (message) => {
      this.handleMessage('personal_notification', message);
    });

    // Subscribe to leaderboard updates
    this.subscribe('/topic/leaderboard', (message) => {
      this.handleMessage('leaderboard_update', message);
    });

    // Subscribe to system announcements
    this.subscribe('/topic/announcements', (message) => {
      this.handleMessage('system_announcement', message);
    });

    // Subscribe to activity updates
    this.subscribe('/topic/activity', (message) => {
      this.handleMessage('activity_update', message);
    });

    // Send connection confirmation
    this.sendMessage('/app/connect', {});
  }

  /**
   * Subscribe to a WebSocket destination
   */
  subscribe(destination: string, messageHandler: MessageHandler): void {
    if (!this.client || !this.connected) {
      console.warn('[WebSocket] Cannot subscribe - not connected');
      return;
    }

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const parsedMessage: NotificationMessage = JSON.parse(message.body);
          messageHandler(parsedMessage);
        } catch (error) {
          errorHandler.handleError(error, {
            component: 'WebSocketService',
            action: 'Parse Message'
          });
        }
      });

      this.subscriptions.set(destination, subscription);
      console.log('[WebSocket] Subscribed to:', destination);

    } catch (error) {
      errorHandler.handleError(error, {
        component: 'WebSocketService',
        action: 'Subscribe',
        details: { destination }
      });
    }
  }

  /**
   * Unsubscribe from a WebSocket destination
   */
  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log('[WebSocket] Unsubscribed from:', destination);
    }
  }

  /**
   * Send message to WebSocket destination
   */
  sendMessage(destination: string, body: any): void {
    if (!this.client || !this.connected) {
      console.warn('[WebSocket] Cannot send message - not connected');
      return;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
      console.log('[WebSocket] Message sent to:', destination);
    } catch (error) {
      errorHandler.handleError(error, {
        component: 'WebSocketService',
        action: 'Send Message',
        details: { destination }
      });
    }
  }

  /**
   * Add message handler for specific message types
   */
  addMessageHandler(messageType: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  /**
   * Remove message handler
   */
  removeMessageHandler(messageType: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming messages and route to appropriate handlers
   */
  private handleMessage(messageType: string, message: NotificationMessage): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          errorHandler.handleError(error, {
            component: 'WebSocketService',
            action: 'Handle Message',
            details: { messageType, message }
          });
        }
      });
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.connected) {
        this.connect().catch(error => {
          console.error('[WebSocket] Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Send level up notification
   */
  sendLevelUp(level: number, points: number): void {
    this.sendMessage('/app/levelup', { level, points });
  }

  /**
   * Send achievement unlock notification
   */
  sendAchievement(name: string, description: string, points: number): void {
    this.sendMessage('/app/achievement', { name, description, points });
  }

  /**
   * Send points earned notification
   */
  sendPointsEarned(points: number, source: string, totalPoints: number): void {
    this.sendMessage('/app/points', { points, source, totalPoints });
  }

  /**
   * Update user status (online/offline)
   */
  updateStatus(status: 'online' | 'offline'): void {
    this.sendMessage('/app/status', { status });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      console.log('[WebSocket] Disconnected manually');
    }
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
// WebSocket reconnect logic improved

// fix: ensure JWT token is attached to WebSocket handshake
