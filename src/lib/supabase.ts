import { createClient } from '@supabase/supabase-js';

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? '';
const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY      ?? '';

if (!supabaseUrl) {
  console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL');
}

/**
 * Returns a Supabase client with the service_role key.
 * This bypasses ALL RLS policies.
 *
 * ⚠️  ONLY USE THIS IN SERVER-SIDE API ROUTES.
 *     NEVER import this in any client component ('use client').
 */
export const getAdminSupabase = () => {
  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is missing. ' +
      'Add it to your .env file and to Vercel Environment Variables.'
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is missing. ' +
      'Add it to your .env file and to Vercel Environment Variables.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
