import { useState, useEffect } from 'react';
import { getMobileBypassStatus } from '@/utils/mobileBypass';

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      // Check for development bypass
      const bypassEnabled = getMobileBypassStatus();
      if (bypassEnabled) {
        setIsMobile(true);
        setIsLoading(false);
        return;
      }

      // Check screen width
      const screenWidth = window.innerWidth;
      const isMobileWidth = screenWidth <= 768;

      // Check user agent for mobile devices
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'android', 'webos', 'iphone', 'ipad', 'ipod', 
        'blackberry', 'windows phone', 'mobile'
      ];
      const isMobileUserAgent = mobileKeywords.some(keyword => 
        userAgent.includes(keyword)
      );

      // Check for touch capability
      const isTouchDevice = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0;

      // Device is considered mobile if it meets width criteria OR 
      // has mobile user agent OR is touch-capable with reasonable width
      const mobile = isMobileWidth || isMobileUserAgent || 
        (isTouchDevice && screenWidth <= 1024);

      setIsMobile(mobile);
      setIsLoading(false);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return { isMobile, isLoading };
};