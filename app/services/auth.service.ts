// Authentication Service
// Handles all authentication API calls, token management, and auto-refresh

const API_BASE_URL = 'http://localhost:4000';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ErrorResponse {
  success: false;
  error?: string;
  errors?: string[];
  code?: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  // Store tokens securely
  private storeTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      console.log('🔐 Tokens stored successfully');
    }
  }

  // Clear tokens
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log('🗑️ Tokens cleared from storage');
    }
  }

  // Get current access token
  getAccessToken(): string | null {
    // First check in-memory token
    if (this.accessToken) {
      return this.accessToken;
    }
    
    // If not in memory, check localStorage and sync
    if (typeof window !== 'undefined') {
      const storedAccessToken = localStorage.getItem('accessToken');
      if (storedAccessToken) {
        this.accessToken = storedAccessToken;
        return storedAccessToken;
      }
    }
    
    return null;
  }

  // Get current refresh token
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // First check in-memory tokens
    let hasTokens = !!this.accessToken && !!this.refreshToken;
    
    // If not in memory, check localStorage and sync
    if (!hasTokens && typeof window !== 'undefined') {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (storedAccessToken && storedRefreshToken) {
        // Sync in-memory tokens with localStorage
        this.accessToken = storedAccessToken;
        this.refreshToken = storedRefreshToken;
        hasTokens = true;
      }
    }
    
    return hasTokens;
  }

  // Debug method to check token state
  debugTokenState(): void {
    console.log('🔍 Auth Service Debug:');
    console.log('  In-memory accessToken:', this.accessToken ? `${this.accessToken.substring(0, 20)}...` : 'null');
    console.log('  In-memory refreshToken:', this.refreshToken ? `${this.refreshToken.substring(0, 20)}...` : 'null');
    
    if (typeof window !== 'undefined') {
      const storedAccess = localStorage.getItem('accessToken');
      const storedRefresh = localStorage.getItem('refreshToken');
      console.log('  localStorage accessToken:', storedAccess ? `${storedAccess.substring(0, 20)}...` : 'null');
      console.log('  localStorage refreshToken:', storedRefresh ? `${storedRefresh.substring(0, 20)}...` : 'null');
    }
    
    console.log('  isAuthenticated():', this.isAuthenticated());
    console.log('  areTokensReady():', this.areTokensReady());
  }

  // Check if tokens are ready (useful for WebSocket connections)
  areTokensReady(): boolean {
    // First check in-memory tokens
    let hasTokens = !!this.accessToken && !!this.refreshToken;
    
    // If not in memory, check localStorage and sync
    if (!hasTokens && typeof window !== 'undefined') {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (storedAccessToken && storedRefreshToken) {
        // Sync in-memory tokens with localStorage
        this.accessToken = storedAccessToken;
        this.refreshToken = storedRefreshToken;
        hasTokens = true;
        console.log('🔄 Synced tokens from localStorage to memory');
      }
    }
    
    if (hasTokens) {
      console.log('✅ Tokens are ready for use');
    } else {
      console.log('⏳ Tokens not yet available');
    }
    return hasTokens;
  }

  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errors?.join(', ') || 'Registration failed');
      }

      if (data.success && data.tokens) {
        this.storeTokens(data.tokens.accessToken, data.tokens.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errors?.join(', ') || 'Login failed');
      }

      if (data.success && data.tokens) {
        this.storeTokens(data.tokens.accessToken, data.tokens.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Refresh tokens
  async refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('🔄 Refreshing tokens...');
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.clearTokens();
        throw new Error(data.error || 'Token refresh failed');
      }

      if (data.success && data.tokens) {
        this.storeTokens(data.tokens.accessToken, data.tokens.refreshToken);
        console.log('✅ Tokens refreshed successfully');
        return data.tokens;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Get user profile
  async getProfile(): Promise<User> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        // Token expired, try to refresh
        await this.refreshTokens();
        const newToken = this.getAccessToken();
        if (!newToken) throw new Error('Failed to refresh token');

        // Retry with new token
        const retryResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
        });

        if (!retryResponse.ok) {
          throw new Error('Failed to fetch profile after refresh');
        }

        const retryData = await retryResponse.json();
        return retryData.user;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    try {
      if (token && refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Make authenticated request with auto-refresh
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let token = this.getAccessToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    // First attempt
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    // If 403, try to refresh and retry
    if (response.status === 403) {
      try {
        await this.refreshTokens();
        token = this.getAccessToken();
        
        if (!token) {
          throw new Error('Failed to refresh token');
        }

        // Retry with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (refreshError) {
        this.clearTokens();
        throw refreshError;
      }
    }

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();










