import { createClient } from '@supabase/supabase-js';

// Supabase environment variables (optional for local prototype demo mode)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-transplant-saathi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock_key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const getAppBaseUrl = (): string => {
  return import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'transplant_saathi_supabase_auth_token'
  }
});
