import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client.
 *
 * Uses the public anon key — safe to expose in client bundles.
 * Row Level Security (RLS) policies control data access.
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Check your .env.local file."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
