// Supabase client factory used by apps.
// Reads from EXPO_PUBLIC_* (mobile) or NEXT_PUBLIC_* (web) env vars.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseClient(
  url: string,
  anonKey: string,
  options?: { accessToken?: string },
): SupabaseClient {
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: options?.accessToken
      ? { headers: { Authorization: `Bearer ${options.accessToken}` } }
      : undefined,
  });
}
