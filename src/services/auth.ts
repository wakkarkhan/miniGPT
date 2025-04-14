import axios from 'axios';

// Types for authentication
export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthError {
  detail: string;
}

let isAuthenticated = false;
const API_BASE_URL = 'https://stg-llmbe.werifaid.com';

// Client-side only functions
const clientAuth = {
  openPopup: (url: string) => {
    if (typeof window === 'undefined') return null;
    return window.open(url, '_blank', 'width=600,height=700');
  },

  listenForCode: (popup: Window | null) => {
    if (typeof window === 'undefined') return Promise.reject('Not in browser');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        popup?.close();
        reject('Login timeout');
      }, 5 * 60 * 1000);

      function handleMessage(event: MessageEvent) {
        console.log('Received message:', event.data);
        if (event.data?.type === 'AUTH_CODE' && event.data?.code) {
          window.removeEventListener('message', handleMessage);
          clearTimeout(timeout);
          resolve(event.data.code);
        }
      }

      window.addEventListener('message', handleMessage);
    });
  },

  storeToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
    document.cookie = `auth_token=${token}; path=/;`;
  }
};

export const auth = {
  login: async (): Promise<void> => {
    try {
      // Get auth URL from our API
      const res = await fetch('/api/auth/login');
      const { authUrl } = await res.json();
      
      // Open login in popup
      const popup = clientAuth.openPopup(authUrl);
      if (!popup) throw new Error('Popup blocked');

      // Wait for code from popup
      const code = await clientAuth.listenForCode(popup);
      console.log('Got auth code:', code);
      
      // Exchange code for token
      const response = await fetch('/api/auth/callback?code=' + code);
      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }
      const data = await response.json();
      
      // Store token
      clientAuth.storeToken(data.access_token);
      isAuthenticated = true;
      
      // Navigate to home
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        isAuthenticated = false;
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },   

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}; 