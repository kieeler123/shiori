import { clearLogsCache, supabase } from "@/lib/supabaseClient";
import { callbackUrl, saveNext } from "@/lib/authRedirect";
import type { OAuthProvider } from "@/features/shiori/type";

export async function startGoogleLogin(next: string) {
  saveNext(next);

  const redirectTo = callbackUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  // 확인 후 진행
  window.location.href = data.url;
}

export async function startOAuthLogin(provider: OAuthProvider, next: string) {
  saveNext(next);

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl() }, // ✅ /auth/callback 통일
  });

  if (error) throw error;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  clearLogsCache();
  if (error) throw error;
}
