export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  },
  tmdb: {
    apiKey: import.meta.env.VITE_TMDB_API_KEY,
    baseUrl: import.meta.env.VITE_TMDB_BASE_URL,
    imageBaseUrl: import.meta.env.VITE_TMDB_IMAGE_BASE_URL,
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
} as const;

// Validate environment variables (API base URL is optional for development)
const requiredEnvVars = [
  'VITE_TMDB_API_KEY',
  'VITE_TMDB_BASE_URL',
  'VITE_TMDB_IMAGE_BASE_URL',
] as const;

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.warn(`Missing environment variable: ${envVar}`);
  }
} 