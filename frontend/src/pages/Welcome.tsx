import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '@/components/WelcomeScreen';
import FuturisticBackground from '@/components/FuturisticBackground';
import { authService, User } from '@/services/authService';

const Welcome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Welcome page: Checking authentication...');
        const { user: currentUser } = await authService.getSession();
        const onboardingCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
        
        console.log('Welcome page: Auth check result', { 
          user: currentUser?.email, 
          onboardingCompleted 
        });
        
        setUser(currentUser);
        setHasCompletedOnboarding(onboardingCompleted);
        
        // Redirect to home if not authenticated
        if (!currentUser) {
          console.log('Welcome page: No user found, redirecting to home');
          navigate('/', { replace: true });
          return;
        }

        // Redirect to home if already completed onboarding
        if (onboardingCompleted) {
          console.log('Welcome page: Onboarding already completed, redirecting to home');
          navigate('/', { replace: true });
        } else {
          console.log('Welcome page: User needs onboarding, showing welcome screen');
        }
      } catch (error) {
        console.error('Welcome page: Auth check failed:', error);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange((newUser) => {
      console.log('Welcome page: Auth state changed:', newUser?.email);
      setUser(newUser);
      if (!newUser) {
        navigate('/', { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleComplete = () => {
    console.log('Welcome page: Onboarding completed');
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        <FuturisticBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading your cinematic journey...</p>
        </div>
      </div>
    );
  }

  if (!user || hasCompletedOnboarding) {
    return null; // Will redirect via useEffect
  }

  return <WelcomeScreen onComplete={handleComplete} />;
};

export default Welcome;