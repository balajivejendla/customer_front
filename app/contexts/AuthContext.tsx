// Authentication Context
// Provides authentication state and methods throughout the application

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import type { User } from '../services/auth.service';
import { debugTokens } from '../utils/token-debug';
import { websocketService } from '../services/websocket.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  connectWebSocket: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
    // Enable token debugging in development
    if (import.meta.env.DEV) {
      console.log('🔧 Token debugging enabled. Use debugTokens() in console.');
    }
  }, []);

  const checkAuth = async () => {
    try {
      // Small delay to ensure localStorage is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (authService.isAuthenticated()) {
        const userData = await authService.getProfile();
        setUser(userData);
        console.log('✅ User authenticated on startup:', userData.email);
      } else {
        console.log('ℹ️ No valid tokens found on startup');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      // Clear invalid tokens
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      console.log('✅ Login successful, tokens stored for:', response.user.email);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authService.register(email, password, name);
      setUser(response.user);
      console.log('✅ Registration successful, tokens stored for:', response.user.email);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      console.log('✅ Logout successful, tokens cleared');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if server logout fails
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Refresh user failed:', error);
      setUser(null);
    }
  };

  const connectWebSocket = () => {
    console.log('🔌 Manually triggering WebSocket connection...');
    websocketService.connect();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    connectWebSocket,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

