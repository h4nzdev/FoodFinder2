import { createClient } from '@supabase/supabase-js';

const DEFAULT_PROJECT_URL = 'https://wboqapkbseuwctqjjill.supabase.co';
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_B39j0ZWHeY_SHpA5JzEvlg_42w4gi-k';

const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

const isPlaceholderUrl =
  !envUrl ||
  envUrl.includes('your-project-id') ||
  envUrl.includes('example.supabase.co');

const isPlaceholderKey =
  !envKey ||
  envKey.includes('your_supabase') ||
  envKey.includes('placeholder');

const supabaseUrl = isPlaceholderUrl ? DEFAULT_PROJECT_URL : envUrl;
const supabasePublishableKey = isPlaceholderKey ? DEFAULT_PUBLISHABLE_KEY : envKey;

export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export function isSupabaseConfigured() {
  return Boolean(supabase);
}
