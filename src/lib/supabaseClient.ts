import { createClient } from "@supabase/supabase-js";

const KEY = "shiori:logs";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // ✅ 이게 필요
  },
});

export function clearLogsCache() {
  localStorage.removeItem(KEY);
}
