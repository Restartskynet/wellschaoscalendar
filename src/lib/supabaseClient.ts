import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// In development without Supabase configured, provide a graceful fallback
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const isSupabaseConfigured = () => isConfigured;

// Edge function URL helper
export const getEdgeFunctionUrl = (functionName: string): string => {
  const baseUrl =
    import.meta.env.VITE_FAMILY_GATE_FUNCTION_URL ||
    (supabaseUrl ? `${supabaseUrl}/functions/v1` : '');
  return `${baseUrl}/${functionName}`;
};
