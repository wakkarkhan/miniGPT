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



export const auth = {
  login: async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }

      // Handle both JSON response and redirect URL
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data: AuthResponse = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        isAuthenticated = true;
        window.location.href = '/';
      } else {
        // If we got a redirect URL, follow it
        const redirectUrl = await response.text();
        window.location.href = redirectUrl;
      }

    } catch (error) {
      isAuthenticated = false;
      console.error('Login error details:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('auth_token');
      isAuthenticated = false;
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    return isAuthenticated && !!token;
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  }
}; 