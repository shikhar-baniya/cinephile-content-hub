import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabase = null;
let supabaseAdmin = null;

const initializeClients = () => {
  if (supabase && supabaseAdmin) return;

  const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { 'x-client-info': '@vercel/node' },
    },
  };

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
};

// Lazy initialization of clients
export const getSupabase = () => {
  initializeClients();
  return supabase;
};

export const getSupabaseAdmin = () => {
  initializeClients();
  return supabaseAdmin;
};