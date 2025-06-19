// Page transition animation component
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  triggerKey: string; // Key that changes when page changes
}

const PageTransition = ({ children, className, triggerKey }: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentKey, setCurrentKey] = useState(triggerKey);

  useEffect(() => {
    if (triggerKey !== currentKey) {
      // Start exit animation
      setIsVisible(false);
      
      // After exit animation, update content and start enter animation
      const timer = setTimeout(() => {
        setCurrentKey(triggerKey);
        setIsVisible(true);
      }, 150); // Half of the transition duration
      
      return () => clearTimeout(timer);
    }
  }, [triggerKey, currentKey]);

  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-in-out",
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-4 scale-95",
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageTransition;