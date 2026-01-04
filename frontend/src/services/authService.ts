import { apiClient } from "./apiClient";

export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  updated_at: string;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: User;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

class AuthService {
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private authChangeListeners: ((user: User | null) => void)[] = [];
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();
    this.startTokenRefreshTimer();
    this.setupVisibilityListener();
  }

  private setupVisibilityListener() {
    // Check session when user returns to the tab
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden && this.currentSession) {
        console.log('Tab became visible, checking session validity');
        try {
          await this.getSession();
        } catch (error) {
          console.error('Session check on visibility change failed:', error);
        }
      }
    });
  }

  private startTokenRefreshTimer() {
    // Clear existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Check token every 5 minutes
    this.refreshTimer = setInterval(async () => {
      if (this.currentSession) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = this.currentSession.expires_at - now;
        
        // Refresh token if it expires in the next 10 minutes
        if (timeUntilExpiry < 600 && timeUntilExpiry > 0) {
          console.log('Proactively refreshing token');
          try {
            await this.getSession(); // This will trigger refresh if needed
          } catch (error) {
            console.error('Proactive token refresh failed:', error);
          }
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private stopTokenRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private loadFromStorage() {
    try {
      const session = localStorage.getItem('cinephile_session');
      if (session) {
        const parsedSession = JSON.parse(session);
        
        // Check if session is expired
        const now = Math.floor(Date.now() / 1000);
        if (parsedSession.expires_at && parsedSession.expires_at > now) {
          this.currentSession = parsedSession;
          this.currentUser = parsedSession.user;
          apiClient.setToken(parsedSession.access_token);
          console.log('Loaded valid session from storage');
        } else {
          console.log('Session expired, clearing storage');
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('Error loading session from storage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage(session: Session | null) {
    if (session) {
      // Ensure expires_at is set if not present
      if (!session.expires_at && session.expires_in) {
        session.expires_at = Math.floor(Date.now() / 1000) + session.expires_in;
      }
      
      localStorage.setItem('cinephile_session', JSON.stringify(session));
      console.log('Session saved to storage, expires at:', new Date(session.expires_at * 1000));
    } else {
      localStorage.removeItem('cinephile_session');
      console.log('Session removed from storage');
    }
  }

  private clearStorage() {
    localStorage.removeItem('cinephile_session');
  }

  private notifyAuthChange(user: User | null) {
    this.authChangeListeners.forEach(listener => listener(user));
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    this.authChangeListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authChangeListeners.indexOf(callback);
      if (index > -1) {
        this.authChangeListeners.splice(index, 1);
      }
    };
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.signUp(email, password);
      
      if (response.session) {
        this.currentSession = response.session;
        this.currentUser = response.user;
        this.saveToStorage(response.session);
        apiClient.setToken(response.session.access_token);
        this.notifyAuthChange(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.signIn(email, password);
      
      if (response.session) {
        this.currentSession = response.session;
        this.currentUser = response.user;
        this.saveToStorage(response.session);
        this.startTokenRefreshTimer();
        apiClient.setToken(response.session.access_token);
        this.notifyAuthChange(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await apiClient.signOut();
    } catch (error) {
      // Handle sign out error silently
    } finally {
      this.currentUser = null;
      this.currentSession = null;
      this.clearStorage();
      this.stopTokenRefreshTimer();
      apiClient.setToken(null);
      this.notifyAuthChange(null);
    }
  }

  async signInWithGoogle(): Promise<{ url: string }> {
    try {
      const origin = window.location.origin;
      const response = await apiClient.initiateGoogleAuth(origin);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.handleGoogleCallback(code);
      
      if (response.session) {
        this.currentSession = response.session;
        this.currentUser = response.user;
        this.saveToStorage(response.session);
        this.startTokenRefreshTimer();
        apiClient.setToken(response.session.access_token);
        this.notifyAuthChange(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  handleTokenCallback(session: any): void {
    try {
      // Decode the access token to get user information
      let user: User = {
        id: 'temp-id',
        email: '',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_metadata: {},
        app_metadata: {}
      };

      try {
        // JWT tokens have 3 parts separated by dots
        const tokenParts = session.access_token.split('.');
        if (tokenParts.length === 3) {
          // Decode the payload (middle part)
          const payload = JSON.parse(atob(tokenParts[1]));
          
          user = {
            id: payload.sub || payload.user_id || 'temp-id',
            email: payload.email || '',
            email_confirmed_at: payload.email_confirmed_at || new Date().toISOString(),
            created_at: payload.created_at || new Date().toISOString(),
            updated_at: payload.updated_at || new Date().toISOString(),
            user_metadata: payload.user_metadata || {
              name: payload.name || payload.user_metadata?.full_name || payload.email?.split('@')[0] || '',
              avatar_url: payload.user_metadata?.avatar_url || payload.user_metadata?.picture || payload.picture || null
            },
            app_metadata: payload.app_metadata || {}
          };
        }
      } catch (decodeError) {
        console.warn('Could not decode token, using minimal user info:', decodeError);
        // Fallback to basic user info
        user.email = session.user?.email || '';
        user.user_metadata = {
          name: session.user?.name || user.email.split('@')[0] || 'User',
          avatar_url: session.user?.avatar || null
        };
      }

      // Ensure session has proper expiration
      const sessionWithExpiry = {
        ...session,
        user,
        expires_at: session.expires_at || (Math.floor(Date.now() / 1000) + (session.expires_in || 3600))
      };

      console.log('Setting user from token callback:', user);
      
      this.currentSession = sessionWithExpiry;
      this.currentUser = user;
      this.saveToStorage(sessionWithExpiry);
      this.startTokenRefreshTimer();
      apiClient.setToken(sessionWithExpiry.access_token);
      this.notifyAuthChange(user);
    } catch (error) {
      console.error('Token callback error:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    if (!this.currentSession) {
      return null;
    }

    try {
      const response = await apiClient.getUser();
      this.currentUser = response.user;
      this.notifyAuthChange(response.user);
      return response.user;
    } catch (error) {
      // If token is invalid, clear session
      this.signOut();
      return null;
    }
  }

  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    if (!this.currentSession) {
      console.log('No current session found');
      return { session: null, user: null };
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (this.currentSession.expires_at <= now) {
      console.log('Session expired, attempting refresh');
      // Try to refresh token
      try {
        if (this.currentSession.refresh_token) {
          const response = await apiClient.refreshToken(this.currentSession.refresh_token);
          if (response.session) {
            console.log('Token refreshed successfully');
            this.currentSession = response.session;
            this.currentUser = response.user;
            this.saveToStorage(response.session);
            apiClient.setToken(response.session.access_token);
            this.notifyAuthChange(response.user);
            return { session: response.session, user: response.user };
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
      
      // If refresh failed, clear session
      console.log('Clearing expired session');
      this.signOut();
      return { session: null, user: null };
    }

    console.log('Returning valid session');
    return { session: this.currentSession, user: this.currentUser };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  async refreshSession(): Promise<{ session: Session | null; user: User | null }> {
    console.log('Manual session refresh requested');
    return await this.getSession();
  }
}

export const authService = new AuthService();
export default authService;