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
      // First API call to get redirect URL
      const response = await fetch('/api/auth/login', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      } else {
        // Get redirect URL
        const redirectUrl = await response.text();
        console.log('Redirect URL:', redirectUrl);
        
        try {
          // Parse the redirect URL to get the actual auth URL
          const authUrl = JSON.parse(redirectUrl).authUrl;
          console.log('Auth URL:', authUrl);
          
          // Create hidden iframe for OAuth flow
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          
          // Create promise to handle auth flow
          const authPromise = new Promise((resolve, reject) => {
            // Listen for message from iframe
            const handleMessage = (event: MessageEvent) => {
              // Accept messages from our origin
              if (event.origin !== window.location.origin) return;
              
              if (event.data?.type === 'AUTH_SUCCESS') {
                // Store token in parent origin localStorage
                localStorage.setItem('auth_token', event.data.token);
                // Also set cookie for additional security
                document.cookie = `auth_token=${event.data.token}; path=/;`;
                
                isAuthenticated = true;
                window.removeEventListener('message', handleMessage);
                resolve(event.data.token);
                
                // Navigate to home page after successful auth
                window.location.href = '/';
              } else if (event.data?.type === 'AUTH_ERROR') {
                window.removeEventListener('message', handleMessage);
                reject(new Error(event.data.error));
              }
            };
            
            window.addEventListener('message', handleMessage);
          });
          
          // Add iframe to document and set src
          document.body.appendChild(iframe);
          iframe.src = authUrl;
          
          // Wait for auth flow to complete
          const token = await authPromise;
          
          // Clean up iframe
          document.body.removeChild(iframe);
          
          // Check if user is authenticated before navigating
          if (auth.isAuthenticated()) {
            // Navigate to home page
            window.location.href = '/';
          } else {
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error('Error in OAuth flow:', error);
          throw error;
        }
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
      // Clear cookie from localhost domain
      document.cookie = 'auth_token=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      isAuthenticated = false;
      window.location.href = '/login';
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  isAuthenticated: () => {
    console.log('[auth.ts] Checking authentication status');
    const token = localStorage.getItem('auth_token');
    // Check cookie from localhost domain
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    console.log('[auth.ts] Token exists:', !!token && !!cookieToken);
    return isAuthenticated && !!token && !!cookieToken;
  },

  getToken: () => {
    const token = localStorage.getItem('auth_token');
    if (token) return Promise.resolve(token);

    // If not in local storage, try to get from enterprisegpt.stg.werifaid.com
    return fetch('https://enterprisegpt.stg.werifaid.com/get-token')
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          return data.token;
        }
        return null;
      });
  }
}; 