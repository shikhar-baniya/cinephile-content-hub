import { useEffect } from 'react';
import { getSecurityBypassStatus } from '@/utils/mobileBypass';

export const useSecurityRestrictions = () => {
  useEffect(() => {
    // Check for development bypass
    const bypassEnabled = getSecurityBypassStatus();
    if (bypassEnabled) {
      console.log('Security restrictions bypassed for development');
      return;
    }
    
    // Temporarily disable security restrictions to fix the infinite loop
    // TODO: Re-enable after fixing the console override issue
    return;
    // Console warning message
    const showConsoleWarning = () => {
      console.clear();
      console.log(
        '%cSTOP!',
        'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
      );
      console.log(
        '%cThis is a browser feature intended for developers. Unauthorized access is prohibited.',
        'color: red; font-size: 16px; font-weight: bold;'
      );
      console.log(
        '%cIf someone told you to copy-paste something here, it is likely a scam.',
        'color: orange; font-size: 14px;'
      );
    };

    // Show warning immediately and on console access
    showConsoleWarning();

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Disable developer tools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showConsoleWarning();
        return false;
      }

      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.keyCode === 73)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showConsoleWarning();
        return false;
      }

      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.keyCode === 74)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showConsoleWarning();
        return false;
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Disable Ctrl+Shift+C (Element Inspector)
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.keyCode === 67)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showConsoleWarning();
        return false;
      }

      // Disable Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Disable Ctrl+A (Select All)
      if (e.ctrlKey && (e.key === 'a' || e.key === 'A' || e.keyCode === 65)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Disable Ctrl+P (Print)
      if (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Disable Ctrl+Shift+K (Firefox Console)
      if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.keyCode === 75)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showConsoleWarning();
        return false;
      }

      // Disable Ctrl+Shift+E (Firefox Network)
      if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.keyCode === 69)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showConsoleWarning();
        return false;
      }
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow selection in input fields and textareas
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Detect developer tools opening (basic detection)
    let devtools = { open: false };
    const threshold = 160;

    const detectDevTools = () => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          showConsoleWarning();
        }
      } else {
        devtools.open = false;
      }
    };

    // Check for dev tools periodically
    const devToolsInterval = setInterval(detectDevTools, 500);

    // Disable print screen (limited effectiveness)
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        showConsoleWarning();
      }
    };

    // Add event listeners with capture phase to ensure they're handled first
    document.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: false });
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    document.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    document.addEventListener('selectstart', handleSelectStart, { capture: true, passive: false });
    document.addEventListener('dragstart', handleDragStart, { capture: true, passive: false });

    // Also add to window for broader coverage
    window.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: false });
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });

    // Store original console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console methods to show warning (but avoid infinite loops)
    let warningShown = false;
    
    console.log = (...args) => {
      if (!warningShown) {
        warningShown = true;
        originalLog(
          '%cSTOP!',
          'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
        );
        originalLog(
          '%cThis is a browser feature intended for developers. Unauthorized access is prohibited.',
          'color: red; font-size: 16px; font-weight: bold;'
        );
        originalLog(
          '%cIf someone told you to copy-paste something here, it is likely a scam.',
          'color: orange; font-size: 14px;'
        );
        setTimeout(() => { warningShown = false; }, 1000);
      }
      return originalLog.apply(console, args);
    };

    console.error = (...args) => {
      return originalError.apply(console, args);
    };

    console.warn = (...args) => {
      return originalWarn.apply(console, args);
    };

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keyup', handleKeyUp, { capture: true });
      document.removeEventListener('selectstart', handleSelectStart, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      
      clearInterval(devToolsInterval);
      
      // Restore console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);
};