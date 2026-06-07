// Mobile Supabase client. Reads config from Expo public env vars
// (EXPO_PUBLIC_*) and persists sessions via AsyncStorage.
//
// This client is shared by every mobile screen. Import:
//   import { supabase } from "../../src/lib/supabase";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Patch react-native's no-op URL/localStorage so @supabase/ssr-style
// storage adapters that fall through to AsyncStorage work. We register
// an AsyncStorage-backed storage adapter manually instead.

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// For web builds, AsyncStorage isn't available, fall back to in-memory.
const MemoryStore = (() => {
  const map = new Map<string, string>();
  return {
    getItem: async (k: string) => map.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: async (k: string) => {
      map.delete(k);
    },
  };
})();

// Expo's secure-store is not available on web builds; in that case
// fall back to an in-memory store. The same shape is used so the
// Supabase client API is identical on iOS/Android/web.
const isWeb = !ExpoSecureStoreAdapter.setItem;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. " +
      "Auth and database calls will fail until these are configured.",
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isWeb ? (MemoryStore as any) : (ExpoSecureStoreAdapter as any),
    autoRefreshToken: true,
    persistSession: !isWeb,
    detectSessionInUrl: false,
  },
  global: {
    headers: { "x-client-info": "amis-dt-mobile" },
  },
});
