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

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const session = localStorage.getItem('cinephile_session');
      if (session) {
        const parsedSession = JSON.parse(session);
        this.currentSession = parsedSession;
        this.currentUser = parsedSession.user;
        apiClient.setToken(parsedSession.access_token);
      }
    } catch (error) {
      this.clearStorage();
    }
  }

  private saveToStorage(session: Session | null) {
    if (session) {
      localStorage.setItem('cinephile_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('cinephile_session');
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
      // Create a user object from the session (we'll need to fetch user details)
      const user = {
        id: session.user?.id || 'temp-id',
        email: session.user?.email || '',
        name: session.user?.user_metadata?.name || session.user?.user_metadata?.full_name || '',
        avatar: session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || null
      };

      this.currentSession = session;
      this.currentUser = user;
      this.saveToStorage(session);
      apiClient.setToken(session.access_token);
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
      return { session: null, user: null };
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (this.currentSession.expires_at <= now) {
      // Try to refresh token
      try {
        const response = await apiClient.refreshToken(this.currentSession.refresh_token);
        if (response.session) {
          this.currentSession = response.session;
          this.currentUser = response.user;
          this.saveToStorage(response.session);
          apiClient.setToken(response.session.access_token);
          return { session: response.session, user: response.user };
        }
      } catch (error) {
        this.signOut();
        return { session: null, user: null };
      }
    }

    return { session: this.currentSession, user: this.currentUser };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }
}

export const authService = new AuthService();
export default authService;