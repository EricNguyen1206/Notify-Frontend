import { ChannelJoinData, ChannelMessageData, ChannelMessageReceivedMessage, MessageType, WsBaseMessage, WsMessageType } from './types/wsTypes';

// Connection states
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// Additional WebSocket-specific types
export interface TypingIndicatorData {
  channel_id: string;
  is_typing: boolean;
}

export interface ErrorData {
  code: string;
  message: string;
  details?: string;
}

export interface UserStatusData {
  user_id: string;
  status: 'online' | 'offline' | 'away';
}

export interface UserNotificationData {
  type: 'message' | 'mention' | 'system';
  title: string;
  message: string;
  channel_id?: string;
}

export interface MemberJoinLeaveData {
  channel_id: string;
  user_id: string;
  username: string;
}

// Type guards for message validation
export const isValidMessageType = (type: string): type is MessageType => {
  return Object.values(WsMessageType).includes(type as MessageType);
};

export const isWsBaseMessage = (data: unknown): data is WsBaseMessage => {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as Record<string, unknown>;
  return (
    typeof msg.id === 'string' &&
    typeof msg.type === 'string' &&
    isValidMessageType(msg.type) &&
    typeof msg.timestamp === 'number' &&
    typeof msg.user_id === 'string' &&
    msg.data !== undefined
  );
};

// WebSocket client configuration
export interface WebSocketClientConfig {
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

// Event listeners interface
export interface WebSocketEventListeners {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: <T>(message: WsBaseMessage<T>) => void;
  onChannelMessage?: (message: ChannelMessageReceivedMessage) => void;
  onTypingIndicator?: (message: WsBaseMessage<TypingIndicatorData>) => void;
  onMemberJoin?: (message: WsBaseMessage<MemberJoinLeaveData>) => void;
  onMemberLeave?: (message: WsBaseMessage<MemberJoinLeaveData>) => void;
  onUserStatus?: (message: WsBaseMessage<UserStatusData>) => void;
  onUserNotification?: (message: WsBaseMessage<UserNotificationData>) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
}

// Enhanced WebSocket client class
export class TypeSafeWebSocketClient {
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private heartbeatInterval: number;
  private connectionTimeout: number;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionTimer: NodeJS.Timeout | null = null;
  private listeners: WebSocketEventListeners = {};
  private url = '';
  private params: Record<string, any> = {};

  constructor(config: WebSocketClientConfig = {}) {
    this.maxReconnectAttempts = config.reconnectAttempts ?? 5;
    this.reconnectDelay = config.reconnectDelay ?? 1000;
    this.heartbeatInterval = config.heartbeatInterval ?? 30000;
    this.connectionTimeout = config.connectionTimeout ?? 10000;
  }

  // Connection management
  async connect(url: string, params?: Record<string, any>): Promise<void> {
    this.url = url;
    this.params = params || {};

    return new Promise((resolve, reject) => {
      try {
        this.setConnectionState(ConnectionState.CONNECTING);

        const query = this.params ? '?' + new URLSearchParams(this.params).toString() : '';
        const wsUrl = url.replace(/^http/, 'ws') + query;

        this.ws = new WebSocket(wsUrl);

        // Connection timeout
        this.connectionTimer = setTimeout(() => {
          if (this.connectionState === ConnectionState.CONNECTING) {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, this.connectionTimeout);

        this.ws.onopen = () => {
          this.clearConnectionTimer();
          this.setConnectionState(ConnectionState.CONNECTED);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.listeners.onConnect?.();
          resolve();
        };

        this.ws.onerror = (error) => {
          this.clearConnectionTimer();
          this.setConnectionState(ConnectionState.ERROR);
          this.listeners.onError?.(error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.clearConnectionTimer();
          this.stopHeartbeat();

          if (this.connectionState === ConnectionState.CONNECTED) {
            this.setConnectionState(ConnectionState.DISCONNECTED);
            this.listeners.onDisconnect?.();
            this.attemptReconnect();
          }
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

      } catch (error) {
        this.setConnectionState(ConnectionState.ERROR);
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.clearTimers();
    this.setConnectionState(ConnectionState.DISCONNECTED);
    this.ws?.close();
    this.ws = null;
  }

  // Message sending methods
  sendMessage<T>(type: MessageType, data: T): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }

    const message: WsBaseMessage<T> = {
      id: this.generateMessageId(),
      type,
      data,
      timestamp: Date.now(),
      user_id: this.params.userId || ''
    };

    this.ws!.send(JSON.stringify(message));
  }

  joinChannel(channelId: string): void {
    this.sendMessage<ChannelJoinData>(WsMessageType.CHANNEL_JOIN, {
      channel_id: channelId
    });
  }

  leaveChannel(channelId: string): void {
    this.sendMessage<ChannelJoinData>(WsMessageType.CHANNEL_LEAVE, {
      channel_id: channelId
    });
  }

  sendChannelMessage(channelId: string, text: string, url?: string, fileName?: string): void {
    this.sendMessage<ChannelMessageData>(WsMessageType.CHANNEL_MESSAGE, {
      channel_id: channelId,
      text,
      url: url || null,
      fileName: fileName || null
    });
  }

  sendTypingIndicator(channelId: string, isTyping: boolean): void {
    const type = isTyping ? WsMessageType.CHANNEL_TYPING : WsMessageType.CHANNEL_STOP_TYPING;
    this.sendMessage<TypingIndicatorData>(type, {
      channel_id: channelId,
      is_typing: isTyping
    });
  }

  // Event listener management
  on<K extends keyof WebSocketEventListeners>(event: K, listener: WebSocketEventListeners[K]): void {
    this.listeners[event] = listener;
  }

  off<K extends keyof WebSocketEventListeners>(event: K): void {
    delete this.listeners[event];
  }

  // Connection state management
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN;
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.listeners.onConnectionStateChange?.(state);
    }
  }

  // Message handling
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      if (!isWsBaseMessage(data)) {
        console.warn('Received invalid WebSocket message:', data);
        return;
      }

      // Handle pong messages for heartbeat
      if (data.type === WsMessageType.PONG) {
        return; // Heartbeat response, no need to emit
      }

      // Emit generic message event
      this.listeners.onMessage?.(data);

      // Emit specific message type events
      switch (data.type) {
        case WsMessageType.CHANNEL_MESSAGE:
          this.listeners.onChannelMessage?.(data as ChannelMessageReceivedMessage);
          break;
        case WsMessageType.CHANNEL_TYPING:
        case WsMessageType.CHANNEL_STOP_TYPING:
          this.listeners.onTypingIndicator?.(data as WsBaseMessage<TypingIndicatorData>);
          break;
        case WsMessageType.MEMBER_JOIN:
          this.listeners.onMemberJoin?.(data as WsBaseMessage<MemberJoinLeaveData>);
          break;
        case WsMessageType.MEMBER_LEAVE:
          this.listeners.onMemberLeave?.(data as WsBaseMessage<MemberJoinLeaveData>);
          break;
        case WsMessageType.USER_STATUS:
          this.listeners.onUserStatus?.(data as WsBaseMessage<UserStatusData>);
          break;
        case WsMessageType.USER_NOTIFICATION:
          this.listeners.onUserNotification?.(data as WsBaseMessage<UserNotificationData>);
          break;
        case WsMessageType.ERROR:
          console.log('WebSocket error message:', data);
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error, event.data);
    }
  }

  // Heartbeat mechanism
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage(WsMessageType.PING, {});
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Reconnection logic
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.setConnectionState(ConnectionState.ERROR);
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionState(ConnectionState.RECONNECTING);

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect(this.url, this.params);
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.attemptReconnect();
      }
    }, delay);
  }

  // Utility methods
  private clearTimers(): void {
    this.clearConnectionTimer();
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearConnectionTimer(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Factory function for Orval compatibility
export const createWebSocketClient = <T = unknown>(
  config: { url: string; method: string; params?: Record<string, any> },
  options?: WebSocketClientConfig
): TypeSafeWebSocketClient => {
  const client = new TypeSafeWebSocketClient(options);

  // Auto-connect if URL is provided
  if (config.url && config.params?.userId) {
    client.connect(config.url, config.params).catch(console.error);
  }

  return client;
};
