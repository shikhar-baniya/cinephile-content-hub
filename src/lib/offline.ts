// Offline support and PWA functionality
import { useDataStore } from './store.enhanced';

export class OfflineManager {
  private static syncQueue: Array<{
    id: string;
    operation: string;
    data: any;
    timestamp: number;
  }> = [];

  static init() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Check initial state
    this.updateOnlineStatus();
    
    // Register service worker for PWA
    this.registerServiceWorker();
  }

  private static handleOnline() {
    console.log('App is online');
    useDataStore.getState().setOfflineStatus(false);
    this.syncPendingOperations();
  }

  private static handleOffline() {
    console.log('App is offline');
    useDataStore.getState().setOfflineStatus(true);
  }

  private static updateOnlineStatus() {
    useDataStore.getState().setOfflineStatus(!navigator.onLine);
  }

  private static async syncPendingOperations() {
    const { pendingOperations, removePendingOperation } = useDataStore.getState();
    
    if (pendingOperations.length === 0) return;
    
    console.log(`Syncing ${pendingOperations.length} pending operations...`);
    
    for (const operation of pendingOperations) {
      try {
        await this.executePendingOperation(operation);
        removePendingOperation(operation.id);
        console.log(`Synced operation: ${operation.type}`);
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        // Keep operation in queue for next sync attempt
      }
    }
  }

  private static async executePendingOperation(operation: any) {
    const { movieService } = await import('@/services/databaseService');
    
    switch (operation.type) {
      case 'create':
        await movieService.addMovie(operation.data);
        break;
      case 'update':
        // Implement update operation
        break;
      case 'delete':
        await movieService.deleteMovie(operation.data.id);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  static queueOperation(type: string, data: any) {
    const { addPendingOperation } = useDataStore.getState();
    addPendingOperation({ type, data });
  }

  private static async registerServiceWorker() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private static showUpdateAvailable() {
    // Show toast notification for app update
    import('sonner').then(({ toast }) => {
      toast.info('New version available!', {
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
        duration: 10000,
      });
    });
  }

  // PWA install prompt
  static async promptInstall() {
    const deferredPrompt = (window as any).deferredPrompt;
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted PWA install');
      } else {
        console.log('User dismissed PWA install');
      }
      
      (window as any).deferredPrompt = null;
    }
  }

  // Cache management
  static async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  static async getCacheSize(): Promise<number> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }
    
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
}

// Initialize offline manager
OfflineManager.init();