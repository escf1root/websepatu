import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL');
}

/**
 * Returns a Supabase client that bypasses RLS policies with the master service key.
 * IMPORTANT: ONLY USE THIS IN SERVER/API ROUTES. NEVER EXPOSE TO CLIENT SIDE.
 */
export const getAdminSupabase = () => {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
