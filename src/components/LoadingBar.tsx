// Subtle loading bar for page transitions
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingBarProps {
  isLoading: boolean;
}

const LoadingBar = ({ isLoading }: LoadingBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const timer = setTimeout(() => {
        setProgress(70);
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        setProgress(0);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div 
        className={cn(
          "h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-300 ease-out",
          progress === 0 ? "w-0" : progress === 100 ? "w-full" : "w-[70%]",
          progress === 100 && "opacity-0"
        )}
      />
    </div>
  );
};

export default LoadingBar;