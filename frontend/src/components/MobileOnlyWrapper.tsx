import { ReactNode } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useSecurityRestrictions } from '@/hooks/useSecurityRestrictions';
import DesktopWarning from './DesktopWarning';

interface MobileOnlyWrapperProps {
  children: ReactNode;
}

const MobileOnlyWrapper = ({ children }: MobileOnlyWrapperProps) => {
  const { isMobile, isLoading } = useDeviceDetection();
  
  // Apply security restrictions regardless of device type
  useSecurityRestrictions();

  // Show loading state while detecting device
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show desktop warning if not on mobile
  if (!isMobile) {
    return <DesktopWarning />;
  }

  // Render the app for mobile devices
  return <>{children}</>;
};

export default MobileOnlyWrapper;