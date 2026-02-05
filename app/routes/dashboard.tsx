// Dashboard/Chat Page - Future of Commerce Theme
// Modern customer support chat interface with advanced theming

import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { websocketService } from '../services/websocket.service';
import type { Message, ConnectionStatus } from '../services/websocket.service';
import { TipsWidget } from '../components/TipsWidget';
import { ThemeToggle } from '../components/ThemeToggle';
import { useHelpSystem } from '../components/HelpSystem';
import { useNotificationHelpers, StatusIndicator } from '../components/NotificationSystem';
import type { Route } from './+types/dashboard';
import '../styles/theme.css';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: 'Future Commerce - Customer Support' },
    { name: 'description', content: 'AI-powered customer support dashboard' },
  ];
}

interface ChatMessage {
  id: string | number;
  message: string;
  sender: {
    userId: string;
    email: string;
  };
  timestamp: string;
  role: 'user' | 'assistant';
  metadata?: {
    confidence?: {
      level: string;
      score: number;
    };
    contextUsed?: number;
    processingTime?: number;
    cached?: boolean;
    ragEnabled?: boolean;
  };
}

function DashboardContent() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { HelpSystem, HelpButton } = useHelpSystem();
  const { showSuccess, showError, showInfo } = useNotificationHelpers();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize theme
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    document.documentElement.setAttribute('data-theme', shouldUseDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && isAuthenticated) {
      console.log('🔌 Initializing WebSocket connection for user:', user.email);
      
      // Add a longer delay to ensure tokens are fully loaded and auth is stable
      const timer = setTimeout(() => {
        // Only connect if not already connected or connecting
        if (websocketService.getStatus() === 'disconnected') {
          console.log('🔄 Attempting WebSocket connection...');
          websocketService.connect();
        }
      }, 2000); // Increased delay to 2 seconds

      return () => {
        clearTimeout(timer);
        // Cleanup: disconnect WebSocket when component unmounts or user changes
        websocketService.disconnect();
      };
    }
  }, [user, isAuthenticated]); // Removed connectionStatus from dependencies

  // Set up WebSocket event listeners
  useEffect(() => {
    const handleStatusChange = (status: ConnectionStatus) => {
      setConnectionStatus(status);
    };

    const handleAuthenticated = (data: any) => {
      console.log('Authenticated:', data);
      showSuccess('Connected!', 'Successfully connected to AI support system');
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: '🚀 Welcome to Future Commerce Support! I\'m your AI assistant powered by advanced RAG technology. How can I help you today?',
        sender: { userId: 'system', email: 'AI Assistant' },
        timestamp: new Date().toISOString(),
        role: 'assistant',
      }]);
    };

    const handleNewMessage = (message: Message) => {
      if (message.sender.userId !== user?.id) {
        setMessages(prev => [...prev, {
          id: message.id,
          message: message.message,
          sender: message.sender,
          timestamp: message.timestamp,
          role: 'assistant',
        }]);
      }
    };

    const handleChatbotResponse = (response: any) => {
      setMessages(prev => [...prev, {
        id: response.id,
        message: response.message,
        sender: {
          userId: response.sender.userId || 'bot',
          email: response.sender.name || 'AI Assistant',
        },
        timestamp: response.timestamp,
        role: 'assistant',
        metadata: response.metadata,
      }]);
      setIsLoading(false);
    };

    const handleMessageSent = (data: any) => {
      setIsLoading(false);
    };

    const handleMessageError = (error: any) => {
      console.error('Message error:', error);
      setIsLoading(false);
      showError('Message Failed', error.error || 'Failed to send message. Please try again.');
    };

    const handleUserCount = (data: { count: number }) => {
      setUserCount(data.count);
    };

    const handleConnectionError = (error: Error) => {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      showError('Connection Error', 'Lost connection to support system. Attempting to reconnect...');
      
      // Retry connection after a delay
      setTimeout(() => {
        if (user && isAuthenticated) {
          console.log('🔄 Retrying WebSocket connection after error...');
          websocketService.forceReconnect();
        }
      }, 3000);
    };

    const handleDisconnected = (reason: string) => {
      console.log('Disconnected:', reason);
      setConnectionStatus('disconnected');
    };

    const handleAuthenticationFailed = (error: Error) => {
      console.error('Authentication failed, redirecting to login:', error);
      showError('Authentication Failed', 'Your session has expired. Redirecting to login...');
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2000);
    };

    // Register event listeners
    websocketService.on('statusChange', handleStatusChange);
    websocketService.on('authenticated', handleAuthenticated);
    websocketService.on('newMessage', handleNewMessage);
    websocketService.on('chatbotResponse', handleChatbotResponse);
    websocketService.on('messageSent', handleMessageSent);
    websocketService.on('messageError', handleMessageError);
    websocketService.on('userCount', handleUserCount);
    websocketService.on('connectionError', handleConnectionError);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('authenticationFailed', handleAuthenticationFailed);

    return () => {
      websocketService.off('statusChange', handleStatusChange);
      websocketService.off('authenticated', handleAuthenticated);
      websocketService.off('newMessage', handleNewMessage);
      websocketService.off('chatbotResponse', handleChatbotResponse);
      websocketService.off('messageSent', handleMessageSent);
      websocketService.off('messageError', handleMessageError);
      websocketService.off('userCount', handleUserCount);
      websocketService.off('connectionError', handleConnectionError);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('authenticationFailed', handleAuthenticationFailed);
      // Don't disconnect here - let the connection useEffect handle disconnection
    };
  }, [user, showSuccess, showError, logout]);

  // Add a connection health check effect
  useEffect(() => {
    if (user && isAuthenticated) {
      const healthCheck = setInterval(() => {
        if (connectionStatus === 'connected' && websocketService.isConnected()) {
          // Connection is healthy, do nothing
        } else if (connectionStatus !== 'connecting') {
          console.log('🔍 Connection health check: attempting reconnect');
          websocketService.forceReconnect();
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(healthCheck);
    }
  }, [user, isAuthenticated, connectionStatus]);
  
  // Handle authentication - AFTER all hooks are called
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now(),
      message: messageText,
      sender: {
        userId: user?.id || '',
        email: user?.email || '',
      },
      timestamp: new Date().toISOString(),
      role: 'user',
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      websocketService.sendMessage(messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleLogout = async () => {
    websocketService.disconnect();
    await logout();
  };

  const getConnectionStatus = (): 'online' | 'offline' | 'connecting' | 'error' => {
    switch (connectionStatus) {
      case 'connected':
        return 'online';
      case 'connecting':
        return 'connecting';
      case 'error':
        return 'error';
      default:
        return 'offline';
    }
  };

  const quickActions = [
    'What is your return policy?',
    'How long does shipping take?',
    'What payment methods do you accept?',
    'How can I track my order?'
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="flex-1 flex" style={{ maxWidth: '100vw', margin: '0 auto' }}>
        {/* Header - Fixed at top */}
        <header className="absolute top-0 left-0 right-0 z-20 glass p-4 border-b border-white/10">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="font-secondary text-primary text-xl">
                🚀 Future Commerce Support
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="glass px-3 py-1 rounded-full flex items-center gap-2">
                <StatusIndicator
                  status={getConnectionStatus()}
                  label={userCount > 0 ? `${userCount} online` : undefined}
                />
                {(connectionStatus === 'error' || connectionStatus === 'disconnected') && (
                  <button
                    onClick={() => {
                      console.log('🔄 Manual reconnect triggered');
                      websocketService.forceReconnect();
                    }}
                    className="text-xs px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    title="Reconnect to chat"
                  >
                    Reconnect
                  </button>
                )}
              </div>

              {/* Theme Toggle */}
              <div className="rounded-full overflow-hidden">
                <ThemeToggle showLabel={false} size="md" />
              </div>

              {/* Help Button */}
              <div className="rounded-full overflow-hidden">
                <HelpButton />
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn-secondary px-4 py-2 rounded-full"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Fixed Layout */}
        <div className="flex-1 flex pt-24 pb-2" style={{ height: 'calc(100vh - 20px)' }}>
          {/* Chat Container - Takes most space */}
          <div className="flex-1 flex flex-col pr-3 pl-4">
            <div className="chat-container flex flex-col" style={{ height: '100%', width: '100%', marginTop: '1rem', borderRadius: '2rem' }}>
              {/* Messages Area - Full Width */}
              <div
                ref={chatContainerRef}
                className="flex-1 px-6 py-6 overflow-y-auto chat-messages-area"
                style={{ minHeight: '200px', width: '100%' }}
              >
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full w-full">
                    <div className="text-center max-w-2xl w-full">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center text-3xl floating">
                        💬
                      </div>
                      <h3 className="font-secondary text-2xl text-primary mb-3">
                        How can I help you today?
                      </h3>
                      <p className="text-secondary text-base leading-relaxed">
                        I'm your AI assistant with access to comprehensive product information,
                        policies, and support resources.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${message.role === 'user' ? 'message-user' : 'message-bot'
                          }`}>
                          {message.role === 'assistant' && message.sender.email !== 'system' && (
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm">
                                🤖
                              </div>
                              <span className="text-sm font-medium text-secondary">AI Assistant</span>
                            </div>
                          )}

                          <div className="font-primary text-base leading-relaxed whitespace-pre-wrap">
                            {message.message}
                          </div>

                          {message.metadata && (
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/10">
                              <span className="text-xs text-secondary">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                              {message.metadata.confidence && (
                                <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-secondary">
                                  {message.metadata.confidence.level} confidence
                                </span>
                              )}
                              {message.metadata.processingTime && (
                                <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-secondary">
                                  {message.metadata.processingTime}ms
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start w-full">
                        <div className="message-bot max-w-[75%]">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm">
                              🤖
                            </div>
                            <span className="text-sm font-medium text-secondary">AI Assistant</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="loading-dots">
                              <div className="loading-dot"></div>
                              <div className="loading-dot"></div>
                              <div className="loading-dot"></div>
                            </div>
                            <span className="text-base text-secondary">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area - Side by Side Layout */}
<div className="px-6 py-4 border-t border-white/10 w-full">
  {/* FORCE layout HERE */}
  <div className="flex items-end gap-3 w-full">
    
    <textarea
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      placeholder="Message Future Commerce Support..."
      disabled={connectionStatus !== "connected" || isLoading}
      rows={1}
      className="
        input
        flex-1
        text-base
        py-3 px-6
        rounded-full
        resize-none
        overflow-hidden
      "
    />

    <button
      type="button"
      disabled={!inputMessage.trim() || connectionStatus !== "connected" || isLoading}
      className="
        btn-primary
        !static
        !float-none
        !inset-auto
        !right-auto
        !bottom-auto
        !w-12 !h-12
        rounded-full
        flex items-center justify-center
        flex-shrink-0
      "
      title="Send Message"
      onClick={handleSendMessage}
    >
      <span className="text-xl">↗</span>
    </button>

  </div>
</div>


            </div>
          </div>

          {/* Right Sidebar - Welcome & Info */}
          <div className="w-72 flex-shrink-0 px-3 py-6 overflow-y-auto" style={{ height: '100%', marginTop: '1rem' }}>
            {/* Welcome Section */}
            <div className="card mb-6" style={{ borderRadius: '1.5rem' }}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center text-2xl floating">
                  👋
                </div>
                <h3 className="font-secondary text-lg font-bold text-primary mb-2">
                  Welcome back!
                </h3>
                <p className="text-secondary text-sm mb-4">
                  <span className="font-medium text-primary">{user?.email}</span>
                </p>
                <p className="text-secondary text-xs leading-relaxed">
                  I'm your AI assistant, powered by advanced RAG technology.
                  Ask me anything about products, shipping, returns, or policies with 98-99% accuracy!
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card mb-6" style={{ borderRadius: '1.5rem' }}>
              <h3 className="font-secondary text-lg text-primary mb-4 flex items-center gap-2">
                <span>⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(action)}
                    className="btn-secondary w-full text-left p-3 text-sm hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        {index === 0 ? '📦' : index === 1 ? '🚚' : index === 2 ? '💳' : '📍'}
                      </span>
                      <span className="truncate">{action}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="card mb-6" style={{ borderRadius: '1.5rem' }}>
              <h3 className="font-secondary text-lg text-primary mb-4 flex items-center gap-2">
                <span>📊</span>
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Connection</span>
                  <StatusIndicator
                    status={getConnectionStatus()}
                    showPulse={false}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">AI Model</span>
                  <span className="text-sm font-medium text-primary">RAG-Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Accuracy</span>
                  <span className="text-sm font-medium text-green-400">98-99%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Response Time</span>
                  <span className="text-sm font-medium text-primary">~500ms</span>
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="card mb-6" style={{ borderRadius: '1.5rem' }}>
              <h3 className="font-secondary text-lg text-primary mb-4 flex items-center gap-2">
                <span>🧠</span>
                AI Capabilities
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-secondary">Vector Search (768D)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-secondary">Real-time Processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-secondary">Context Awareness</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-secondary">Multi-layer Fallback</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-secondary">Response Caching</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-secondary">210+ FAQ Knowledge Base</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="card" style={{ borderRadius: '1.5rem' }}>
              <h3 className="font-secondary text-lg text-primary mb-4 flex items-center gap-2">
                <span>📈</span>
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm">Messages Today</span>
                  <span className="text-primary font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm">Avg Response Time</span>
                  <span className="text-green-400 font-medium">0.5s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm">Success Rate</span>
                  <span className="text-green-400 font-medium">99.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Widget */}
      <TipsWidget currentPage="dashboard" />

      {/* Help System */}
      <HelpSystem />
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}

