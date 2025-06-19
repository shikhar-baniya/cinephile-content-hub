import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabase = null;
let supabaseAdmin = null;

const initializeClients = () => {
  if (supabase && supabaseAdmin) return;

  // Validate environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Missing required Supabase environment variables');
    throw new Error('Supabase configuration is incomplete');
  }

  const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { 'x-client-info': '@vercel/node' },
    },
    // Add connection pooling and timeout settings for better performance
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  };

  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      options
    );

    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
      options
    );

    console.log('Supabase clients initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase clients:', error);
    throw error;
  }
};

// Lazy initialization of clients
export const getSupabase = () => {
  try {
    initializeClients();
    return supabase;
  } catch (error) {
    console.error('Error getting Supabase client:', error);
    throw error;
  }
};

export const getSupabaseAdmin = () => {
  try {
    initializeClients();
    return supabaseAdmin;
  } catch (error) {
    console.error('Error getting Supabase admin client:', error);
    throw error;
  }
};