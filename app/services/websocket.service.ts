// WebSocket Service
// Handles Socket.IO connection with JWT authentication, reconnection, and event management

import { io, Socket } from 'socket.io-client';
import { authService } from './auth.service';

const WS_URL = 'http://localhost:3001';

export interface Message {
  id: string | number;
  message: string;
  sender: {
    userId: string;
    email: string;
  };
  timestamp: string;
  room?: string;
}

export interface UserCount {
  count: number;
  timestamp: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

class WebSocketService {
  private socket: Socket | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  // Connection status getter
  getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Connect to WebSocket server with retry logic
  connect(): void {
    console.log('🔌 WebSocket connect() called');
    console.log('  Current status:', this.connectionStatus);
    console.log('  Socket exists:', !!this.socket);
    console.log('  Socket connected:', this.socket?.connected);
    
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    // Disconnect any existing socket first
    if (this.socket) {
      console.log('🔄 Cleaning up existing socket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    // Reset reconnect attempts when manually connecting
    this.reconnectAttempts = 0;
    this.attemptConnection();
  }

  // Force reconnect (useful after page refresh or token refresh)
  forceReconnect(): void {
    console.log('🔄 Force reconnecting WebSocket...');
    this.disconnect();
    // Wait a bit longer to ensure the server cleans up the old session
    setTimeout(() => {
      this.connect();
    }, 2000);
  }

  private attemptConnection(retryCount: number = 0): void {
    console.log(`🔍 WebSocket connection attempt ${retryCount + 1}/5`);
    console.log(`🌐 Attempting to connect to: ${WS_URL}`);
    
    // Debug token state
    authService.debugTokenState();
    
    if (!authService.areTokensReady()) {
      if (retryCount < 5) { // Increased retry attempts
        const delay = Math.min((retryCount + 1) * 1000, 3000); // Progressive delay up to 3 seconds
        console.log(`🔄 Tokens not ready, retrying in ${delay}ms... (attempt ${retryCount + 1}/5)`);
        setTimeout(() => this.attemptConnection(retryCount + 1), delay);
        return;
      } else {
        console.error('❌ Cannot connect: Tokens not ready after 5 attempts');
        this.connectionStatus = 'error';
        this.emit('statusChange', 'error');
        return;
      }
    }

    const accessToken = authService.getAccessToken();
    if (!accessToken) {
      console.error('❌ Access token is null even though areTokensReady() returned true');
      this.connectionStatus = 'error';
      this.emit('statusChange', 'error');
      return;
    }

    console.log('🔌 Connecting to WebSocket with token:', accessToken.substring(0, 20) + '...');
    console.log('🔗 WebSocket URL:', WS_URL);
    console.log('🌐 Connection options:', {
      auth: { token: '***' },
      transports: ['polling'],
      reconnection: false,
      timeout: 10000
    });
    
    this.connectionStatus = 'connecting';
    this.emit('statusChange', 'connecting');

    try {
      this.socket = io(WS_URL, {
        auth: {
          token: accessToken,
        },
        transports: ['polling'], // Use only polling initially to avoid transport issues
        reconnection: false, // Disable automatic reconnection to prevent session conflicts
        timeout: 10000,
        // Remove forceNew to prevent session conflicts
      });

      // Add a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.connectionStatus === 'connecting') {
          console.log('⏰ Connection timeout - forcing disconnect');
          this.socket?.disconnect();
          this.connectionStatus = 'error';
          this.emit('statusChange', 'error');
          this.emit('connectionError', new Error('Connection timeout'));
        }
      }, 15000); // 15 second timeout

      // Clear timeout on successful connection
      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('🚨 Error creating socket connection:', error);
      this.connectionStatus = 'error';
      this.emit('statusChange', 'error');
    }
  }

  // Setup event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return;

    console.log('🔧 Setting up WebSocket event handlers...');

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.emit('statusChange', 'connected');
    });

    // Authentication confirmed
    this.socket.on('authenticated', (data: any) => {
      console.log('✅ WebSocket authenticated:', data);
      this.emit('authenticated', data);
    });

    // Connection error
    this.socket.on('connect_error', async (error: Error) => {
      console.error('❌ WebSocket connection error:', error.message);
      console.error('🔍 Error details:', error);
      
      this.connectionStatus = 'error';
      this.emit('statusChange', 'error');
      this.emit('connectionError', error);
      
      // Don't auto-reconnect, let the user manually reconnect
      console.log('🔄 Connection failed. Use manual reconnect to try again.');
    });

    // Disconnection
    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.emit('statusChange', 'disconnected');
      this.emit('disconnected', reason);
    });

    // New message received
    this.socket.on('newMessage', (message: Message) => {
      console.log('💬 New message:', message);
      this.emit('newMessage', message);
    });

    // Chatbot response received
    this.socket.on('chatbotResponse', (response: any) => {
      console.log('🤖 Chatbot response:', response);
      this.emit('chatbotResponse', response);
    });

    // Message processing status
    this.socket.on('messageProcessing', (data: any) => {
      console.log('⏳ Message processing:', data);
      this.emit('messageProcessing', data);
    });

    // User count update
    this.socket.on('userCount', (data: UserCount) => {
      console.log('👥 User count:', data.count);
      this.emit('userCount', data);
    });

    // Room joined
    this.socket.on('roomJoined', (data: any) => {
      console.log('🏠 Room joined:', data);
      this.emit('roomJoined', data);
    });

    // User joined room
    this.socket.on('userJoinedRoom', (data: any) => {
      console.log('👋 User joined room:', data);
      this.emit('userJoinedRoom', data);
    });

    // User left room
    this.socket.on('userLeftRoom', (data: any) => {
      console.log('👋 User left room:', data);
      this.emit('userLeftRoom', data);
    });

    // Message sent confirmation
    this.socket.on('messageSent', (data: any) => {
      console.log('✅ Message sent:', data);
      this.emit('messageSent', data);
    });

    // Message error
    this.socket.on('messageError', (error: any) => {
      console.error('❌ Message error:', error);
      this.emit('messageError', error);
    });

    // Room error
    this.socket.on('roomError', (error: any) => {
      console.error('❌ Room error:', error);
      this.emit('roomError', error);
    });

    // Pong response
    this.socket.on('pong', (data: any) => {
      console.log('🏓 Pong received:', data);
      this.emit('pong', data);
    });

    // Disconnection
    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.emit('statusChange', 'disconnected');
      this.emit('disconnected', reason);
    });

    // Connection error
    this.socket.on('connect_error', async (error: Error) => {
      console.error('❌ WebSocket connection error:', error.message);
      
      // If authentication error, try to refresh token and reconnect (but only once)
      if ((error.message.includes('Authentication') || error.message.includes('token')) && this.reconnectAttempts === 0) {
        try {
          console.log('🔄 Attempting to refresh tokens for WebSocket connection...');
          await authService.refreshTokens();
          this.disconnect();
          setTimeout(() => this.connect(), 1000);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // If refresh fails, clear tokens and redirect to login
          await authService.logout();
          this.connectionStatus = 'error';
          this.emit('statusChange', 'error');
          this.emit('connectionError', error);
          
          // Emit a special event for auth failure
          this.emit('authenticationFailed', refreshError);
        }
      } else {
        this.connectionStatus = 'error';
        this.emit('statusChange', 'error');
        this.emit('connectionError', error);
      }
    });

    // Reconnection attempt
    this.socket.io.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
      this.emit('reconnectAttempt', attemptNumber);
    });

    // Reconnection successful
    this.socket.io.on('reconnect', (attemptNumber: number) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
      this.emit('reconnected', attemptNumber);
    });

    // Socket error
    this.socket.on('socketError', (error: any) => {
      console.error('🚨 Socket error:', error);
      this.emit('socketError', error);
    });
  }

  // Send message
  sendMessage(message: string, room?: string): void {
    if (!this.socket?.connected) {
      console.error('Cannot send message: Not connected');
      this.emit('messageError', { error: 'Not connected to server' });
      return;
    }

    if (!message.trim()) {
      this.emit('messageError', { error: 'Message cannot be empty' });
      return;
    }

    this.socket.emit('sendMessage', {
      message: message.trim(),
      room: room,
    });
  }

  // Join room
  joinRoom(roomName: string): void {
    if (!this.socket?.connected) {
      console.error('Cannot join room: Not connected');
      return;
    }

    if (!roomName || typeof roomName !== 'string') {
      this.emit('roomError', { error: 'Invalid room name' });
      return;
    }

    this.socket.emit('joinRoom', roomName);
  }

  // Leave room
  leaveRoom(roomName: string): void {
    if (!this.socket?.connected) {
      console.error('Cannot leave room: Not connected');
      return;
    }

    this.socket.emit('leaveRoom', roomName);
  }

  // Ping server
  ping(): void {
    if (!this.socket?.connected) {
      console.error('Cannot ping: Not connected');
      return;
    }

    this.socket.emit('ping');
  }

  // Disconnect
  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket...');
    if (this.socket) {
      this.socket.removeAllListeners(); // Remove all listeners first
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = 'disconnected';
      this.emit('statusChange', 'disconnected');
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Reconnect with new token (after token refresh)
  async reconnectWithNewToken(): Promise<void> {
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connect();
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

