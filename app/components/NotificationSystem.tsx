// Notification System Component - HCI User Feedback
// Provides toast notifications and status updates following HCI principles

import React, { useState, useEffect, createContext, useContext } from 'react';
import '../styles/theme.css';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-400/30 bg-green-50/80';
      case 'error':
        return 'border-red-400/30 bg-red-50/80';
      case 'warning':
        return 'border-yellow-400/30 bg-yellow-50/80';
      case 'info':
        return 'border-blue-400/30 bg-blue-50/80';
      default:
        return 'border-gray-400/30 bg-gray-50/80';
    }
  };

  return (
    <div
      className={`
        notification glass p-4 rounded-lg shadow-lg border
        transform transition-all duration-300 ease-out
        ${getColorClasses()}
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">
          {getIcon()}
        </span>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-secondary font-semibold text-primary text-sm mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-secondary leading-relaxed">
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="text-secondary hover:text-primary transition-colors p-1 flex-shrink-0"
          title="Close notification"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Convenience hooks for different notification types
export function useNotificationHelpers() {
  const { addNotification } = useNotifications();

  return {
    showSuccess: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'success', title, message, ...options }),
    
    showError: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'error', title, message, duration: 7000, ...options }),
    
    showWarning: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'warning', title, message, ...options }),
    
    showInfo: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'info', title, message, ...options }),
  };
}

// Status indicator component for connection states
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'connecting' | 'error';
  label?: string;
  showPulse?: boolean;
}

export function StatusIndicator({ status, label, showPulse = true }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return { color: 'bg-green-400', text: 'Online', icon: '🟢' };
      case 'offline':
        return { color: 'bg-gray-400', text: 'Offline', icon: '⚫' };
      case 'connecting':
        return { color: 'bg-yellow-400', text: 'Connecting', icon: '🟡' };
      case 'error':
        return { color: 'bg-red-400', text: 'Error', icon: '🔴' };
      default:
        return { color: 'bg-gray-400', text: 'Unknown', icon: '⚫' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div 
          className={`
            w-3 h-3 rounded-full ${config.color}
            ${status === 'connecting' && showPulse ? 'animate-pulse' : ''}
          `}
        />
        {status === 'connecting' && showPulse && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping opacity-75`} />
        )}
      </div>
      <span className="text-sm font-medium text-secondary">
        {label || config.text}
      </span>
    </div>
  );
}

// Progress indicator for loading states
interface ProgressIndicatorProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export function ProgressIndicator({ progress, label, showPercentage = true }: ProgressIndicatorProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-secondary">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-secondary">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}