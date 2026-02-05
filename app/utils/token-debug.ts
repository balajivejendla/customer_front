// Token Debug Utility
// Helper functions to debug JWT token issues

import { authService } from '../services/auth.service';

export function debugTokens() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('🔍 Token Debug Info:');
  console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'Not found');
  console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'Not found');
  
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      console.log('Access Token Payload:', {
        userId: payload.userId,
        email: payload.email,
        exp: new Date(payload.exp * 1000).toISOString(),
        isExpired: Date.now() > payload.exp * 1000
      });
    } catch (error) {
      console.error('Failed to decode access token:', error);
    }
  }
  
  if (refreshToken) {
    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      console.log('Refresh Token Payload:', {
        userId: payload.userId,
        email: payload.email,
        exp: new Date(payload.exp * 1000).toISOString(),
        isExpired: Date.now() > payload.exp * 1000
      });
    } catch (error) {
      console.error('Failed to decode refresh token:', error);
    }
  }
}

// Add to window for easy debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).debugTokens = debugTokens;
  (window as any).authService = {
    debugTokenState: () => authService.debugTokenState(),
    areTokensReady: () => authService.areTokensReady(),
    isAuthenticated: () => authService.isAuthenticated(),
    getAccessToken: () => authService.getAccessToken()
  };
}