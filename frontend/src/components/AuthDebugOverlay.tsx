import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

const AuthDebugOverlay = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const updateDebugInfo = async () => {
      const { user, session } = await authService.getSession();
      const onboardingCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
      
      setDebugInfo({
        user: user?.email || 'No user',
        hasSession: !!session,
        onboardingCompleted,
        currentPath: window.location.pathname,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    updateDebugInfo();
    
    // Update every 2 seconds
    const interval = setInterval(updateDebugInfo, 2000);
    
    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange(() => {
      updateDebugInfo();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 right-4 z-50 bg-red-600 text-white px-2 py-1 rounded text-xs"
      >
        Debug
      </button>

      {/* Debug overlay */}
      {isVisible && (
        <div className="fixed top-12 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-xs">
          <h3 className="font-bold mb-2">Auth Debug</h3>
          <div className="space-y-1">
            <div>User: {debugInfo.user}</div>
            <div>Session: {debugInfo.hasSession ? 'Yes' : 'No'}</div>
            <div>Onboarding: {debugInfo.onboardingCompleted ? 'Done' : 'Pending'}</div>
            <div>Path: {debugInfo.currentPath}</div>
            <div>Updated: {debugInfo.timestamp}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthDebugOverlay;