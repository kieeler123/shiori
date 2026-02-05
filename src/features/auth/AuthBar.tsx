import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/features/auth/useAuth";

export default function AuthBar() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signInGoogle() {
    setBusy(true);
    setMsg(null);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink() {
    if (!email.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setMsg("메일 확인해줘. 링크 클릭하면 로그인돼.");
    } catch (e: any) {
      setMsg(e?.message ?? "로그인 요청 실패");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-4 text-sm text-zinc-400">
        auth loading...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-4">
      {user ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-zinc-200">로그인됨</div>
            <div className="truncate text-xs text-zinc-400">
              {user.email ?? user.id}
            </div>
          </div>
          <button
            onClick={signOut}
            disabled={busy}
            className="rounded-xl border border-zinc-700/70 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={signInGoogle}
              disabled={busy}
              className="rounded-xl border border-zinc-700/70 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
            >
              Google로 로그인
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email (magic link)"
              className="w-64 rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-700/60"
            />
            <button
              onClick={sendMagicLink}
              disabled={busy}
              className="rounded-xl border border-zinc-700/70 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
            >
              매직링크 보내기
            </button>
          </div>

          {msg ? <div className="text-xs text-zinc-400">{msg}</div> : null}
        </div>
      )}
    </div>
  );
}
