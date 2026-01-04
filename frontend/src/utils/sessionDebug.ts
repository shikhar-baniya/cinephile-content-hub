// Development utility for debugging session issues

export const debugSession = () => {
  if (import.meta.env.DEV) {
    const session = localStorage.getItem('cinephile_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = parsed.expires_at - now;
        
        console.log('=== SESSION DEBUG ===');
        console.log('Session exists:', !!session);
        console.log('User:', parsed.user?.email || 'No user');
        console.log('Expires at:', new Date(parsed.expires_at * 1000).toLocaleString());
        console.log('Time until expiry:', Math.floor(timeUntilExpiry / 60), 'minutes');
        console.log('Is expired:', timeUntilExpiry <= 0);
        console.log('Has refresh token:', !!parsed.refresh_token);
        console.log('Access token (first 50 chars):', parsed.access_token?.substring(0, 50) + '...');
        console.log('====================');
        
        return {
          hasSession: true,
          user: parsed.user,
          expiresAt: new Date(parsed.expires_at * 1000),
          isExpired: timeUntilExpiry <= 0,
          minutesUntilExpiry: Math.floor(timeUntilExpiry / 60)
        };
      } catch (error) {
        console.error('Error parsing session:', error);
        return { hasSession: false, error: 'Invalid session data' };
      }
    } else {
      console.log('=== SESSION DEBUG ===');
      console.log('No session found in localStorage');
      console.log('====================');
      return { hasSession: false };
    }
  }
};

export const clearSession = () => {
  if (import.meta.env.DEV) {
    localStorage.removeItem('cinephile_session');
    console.log('Session cleared');
  }
};

// Add to window for easy access in dev tools
if (import.meta.env.DEV) {
  (window as any).sessionDebug = {
    check: debugSession,
    clear: clearSession
  };
}