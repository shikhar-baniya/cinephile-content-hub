import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useAuth } from '@/lib/auth';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, hasCompletedOnboarding, setOnboardingCompleted } = useAuth();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    // Redirect to home if already completed onboarding
    if (hasCompletedOnboarding) {
      navigate('/', { replace: true });
    }
  }, [user, hasCompletedOnboarding, navigate]);

  const handleComplete = () => {
    setOnboardingCompleted();
  };

  if (!user || hasCompletedOnboarding) {
    return null; // Will redirect via useEffect
  }

  return <WelcomeScreen onComplete={handleComplete} />;
};

export default Welcome;