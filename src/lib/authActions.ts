import { supabase } from "@/lib/supabaseClient";
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

  // ✅ 안 사라지게 고정
  alert(`redirectTo:\n${redirectTo}\n\noauth url:\n${data.url}`);

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
  if (error) throw error;
}
