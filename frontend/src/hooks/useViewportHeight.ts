import { useEffect, useState } from 'react';

export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateHeight = () => {
      // Use visualViewport if available (better for mobile)
      const height = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(height);
    };

    // Initial measurement
    updateHeight();

    // Listen for viewport changes
    window.addEventListener('resize', updateHeight);
    
    // Listen for visual viewport changes (mobile keyboard, etc.)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateHeight);
      }
    };
  }, []);

  return viewportHeight;
};