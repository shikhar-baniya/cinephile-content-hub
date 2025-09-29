import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { config } from '@/config/env';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  requiresEmailConfirmation: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      error: null,
      requiresEmailConfirmation: false,

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null, requiresEmailConfirmation: false });
          
          const response = await fetch(`${config.api.baseUrl}/auth/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            if (data.requiresEmailConfirmation) {
              set({ 
                error: data.error, 
                isLoading: false, 
                requiresEmailConfirmation: true 
              });
            } else {
              set({ error: data.error || 'Login failed', isLoading: false });
            }
            throw new Error(data.error || 'Login failed');
          }
          
          set({
            user: data.user,
            session: data.session,
            isLoading: false,
            requiresEmailConfirmation: false,
          });
        } catch (error: any) {
          if (!error.message.includes('email')) {
            set({ error: error.message, isLoading: false });
          }
          throw error;
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null, requiresEmailConfirmation: false });
          
          const response = await fetch(`${config.api.baseUrl}/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ error: data.error || 'Registration failed', isLoading: false });
            throw new Error(data.error || 'Registration failed');
          }
          
          // For signup, don't set user/session - user needs to confirm email first
          set({
            user: null,
            session: null,
            isLoading: false,
            requiresEmailConfirmation: true,
            error: null,
          });
          // Clear persisted auth state
          localStorage.removeItem('auth-storage');
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`${config.api.baseUrl}/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ origin: window.location.origin }),
          });

          const data = await response.json();
          console.log('Google OAuth response:', data);

          if (!response.ok) {
            set({ error: data.error || 'Google authentication failed', isLoading: false });
            throw new Error(data.error || 'Google authentication failed');
          }

          // Redirect to Google OAuth URL
          console.log('Redirecting to:', data.url);
          window.location.href = data.url;
        } catch (error: any) {
          console.error('Google OAuth error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null });
          // Call backend logout
          await fetch(`${config.api.baseUrl}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          // Clear all local/session storage and caches
          localStorage.clear();
          sessionStorage.clear();
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
          }
          set({ user: null, session: null, isLoading: false });
        } catch (error: any) {
          set({ user: null, session: null, error: error.message, isLoading: false });
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`${config.api.baseUrl}/auth/reset-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Password reset failed');
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`${config.api.baseUrl}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Profile update failed');
          }

          const updatedUser = await response.json();

          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      resendConfirmation: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`${config.api.baseUrl}/auth/resend-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ error: data.error || 'Failed to resend confirmation', isLoading: false });
            throw new Error(data.error || 'Failed to resend confirmation');
          }

          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);