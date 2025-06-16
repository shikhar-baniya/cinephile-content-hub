// Centralized application configuration
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    buildDate: string;
  };
  features: {
    analytics: boolean;
    offline: boolean;
    pwa: boolean;
    debugging: boolean;
    performanceMonitoring: boolean;
    errorTracking: boolean;
  };
  api: {
    tmdb: {
      baseUrl: string;
      apiKey: string;
      imageBaseUrl: string;
      rateLimit: {
        requests: number;
        windowMs: number;
      };
    };
    supabase: {
      url: string;
      anonKey: string;
    };
  };
  ui: {
    pagination: {
      defaultPageSize: number;
      maxPageSize: number;
    };
    images: {
      lazyLoading: boolean;
      placeholder: string;
      quality: number;
    };
    animations: {
      enabled: boolean;
      duration: number;
    };
  };
  performance: {
    virtualScrolling: {
      enabled: boolean;
      threshold: number;
    };
    caching: {
      queryStaleTime: number;
      queryGcTime: number;
    };
    monitoring: {
      slowRenderThreshold: number;
      slowApiThreshold: number;
    };
  };
  security: {
    csp: {
      enabled: boolean;
      reportUri?: string;
    };
    rateLimit: {
      enabled: boolean;
      requests: number;
      windowMs: number;
    };
  };
}

const createConfig = (): AppConfig => {
  const env = import.meta.env.MODE as AppConfig['app']['environment'];
  
  return {
    app: {
      name: 'CineTracker',
      version: '1.0.0',
      environment: env,
      buildDate: new Date().toISOString(),
    },
    features: {
      analytics: true,
      offline: env !== 'development',
      pwa: env === 'production',
      debugging: env === 'development',
      performanceMonitoring: true,
      errorTracking: env === 'production',
    },
    api: {
      tmdb: {
        baseUrl: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
        apiKey: import.meta.env.VITE_TMDB_API_KEY || '',
        imageBaseUrl: import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
        rateLimit: {
          requests: 40,
          windowMs: 10000,
        },
      },
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
    },
    ui: {
      pagination: {
        defaultPageSize: 20,
        maxPageSize: 100,
      },
      images: {
        lazyLoading: true,
        placeholder: '/placeholder-image.jpg',
        quality: 75,
      },
      animations: {
        enabled: true,
        duration: 300,
      },
    },
    performance: {
      virtualScrolling: {
        enabled: true,
        threshold: 100, // Enable virtual scrolling for lists > 100 items
      },
      caching: {
        queryStaleTime: 5 * 60 * 1000, // 5 minutes
        queryGcTime: 30 * 60 * 1000, // 30 minutes
      },
      monitoring: {
        slowRenderThreshold: 16, // 16ms for 60fps
        slowApiThreshold: 2000, // 2 seconds
      },
    },
    security: {
      csp: {
        enabled: env === 'production',
        reportUri: env === 'production' ? '/api/csp-report' : undefined,
      },
      rateLimit: {
        enabled: env === 'production',
        requests: 100,
        windowMs: 60000, // 1 minute
      },
    },
  };
};

// Validate configuration
const validateConfig = (config: AppConfig): void => {
  const errors: string[] = [];

  // Validate required environment variables
  if (!config.api.tmdb.apiKey) {
    errors.push('Missing VITE_TMDB_API_KEY');
  }
  if (!config.api.supabase.url) {
    errors.push('Missing VITE_SUPABASE_URL');
  }
  if (!config.api.supabase.anonKey) {
    errors.push('Missing VITE_SUPABASE_ANON_KEY');
  }

  // Validate configuration values
  if (config.ui.pagination.defaultPageSize <= 0) {
    errors.push('Invalid pagination.defaultPageSize');
  }
  if (config.ui.pagination.maxPageSize < config.ui.pagination.defaultPageSize) {
    errors.push('maxPageSize must be greater than defaultPageSize');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Create and validate configuration
export const appConfig = createConfig();

try {
  validateConfig(appConfig);
} catch (error) {
  console.error('Configuration Error:', error);
  if (appConfig.app.environment === 'production') {
    throw error; // Fail fast in production
  }
}

// Export individual config sections for easier imports
export const {
  app: appInfo,
  features,
  api: apiConfig,
  ui: uiConfig,
  performance: performanceConfig,
  security: securityConfig,
} = appConfig;

// Configuration utilities
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return features[feature];
};

export const isDevelopment = (): boolean => {
  return appConfig.app.environment === 'development';
};

export const isProduction = (): boolean => {
  return appConfig.app.environment === 'production';
};

export const getApiEndpoint = (service: keyof AppConfig['api']): string => {
  return apiConfig[service].baseUrl || apiConfig[service].url;
};

// Runtime configuration updates (for A/B testing, feature flags, etc.)
class ConfigManager {
  private static overrides: Partial<AppConfig> = {};

  static setOverride<K extends keyof AppConfig>(
    key: K,
    value: Partial<AppConfig[K]>
  ): void {
    this.overrides[key] = { ...this.overrides[key], ...value };
  }

  static getConfig(): AppConfig {
    return {
      ...appConfig,
      ...this.overrides,
    };
  }

  static clearOverrides(): void {
    this.overrides = {};
  }
}

export { ConfigManager };