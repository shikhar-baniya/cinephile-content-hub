// Development utility to bypass mobile restrictions
// This should only be used during development and testing

export const getMobileBypassStatus = (): boolean => {
  try {
    // Check if we're in development mode
    const isDev = import.meta.env.DEV;
    
    // Check for bypass flag in localStorage (for testing)
    const bypassFlag = localStorage.getItem('mobile-bypass') === 'true';
    
    // Check for URL parameter (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlBypass = urlParams.get('mobile-bypass') === 'true';
    
    // Temporarily enable bypass by default in development for debugging
    return isDev || bypassFlag || urlBypass;
  } catch (error) {
    // If there's any error accessing localStorage or URL, return false
    return false;
  }
};

export const setMobileBypass = (enabled: boolean): void => {
  if (import.meta.env.DEV) {
    localStorage.setItem('mobile-bypass', enabled.toString());
    console.log(`Mobile bypass ${enabled ? 'enabled' : 'disabled'}`);
  }
};

export const getSecurityBypassStatus = (): boolean => {
  try {
    // Check if we're in development mode
    const isDev = import.meta.env.DEV;
    
    // Check for security bypass flag in localStorage (for testing)
    const bypassFlag = localStorage.getItem('security-bypass') === 'true';
    
    // Check for URL parameter (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlBypass = urlParams.get('security-bypass') === 'true';
    
    // Temporarily enable bypass by default in development for debugging
    return isDev || bypassFlag || urlBypass;
  } catch (error) {
    return false;
  }
};

export const setSecurityBypass = (enabled: boolean): void => {
  if (import.meta.env.DEV) {
    localStorage.setItem('security-bypass', enabled.toString());
    console.log(`Security bypass ${enabled ? 'enabled' : 'disabled'}`);
  }
};

// Console helper for development
if (import.meta.env.DEV) {
  (window as any).mobileBypass = {
    enable: () => setMobileBypass(true),
    disable: () => setMobileBypass(false),
    status: getMobileBypassStatus
  };
  
  (window as any).securityBypass = {
    enable: () => setSecurityBypass(true),
    disable: () => setSecurityBypass(false),
    status: getSecurityBypassStatus
  };
}