import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "./useSession";

export default function AuthPanel() {
  const { isAuthed, user } = useSession();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const emailValid = useMemo(() => email.includes("@"), [email]);

  async function sendMagicLink() {
    if (!emailValid) return;
    setBusy(true);
    setMsg(null);
    try {
      const redirectTo = window.location.origin; // 배포 후에도 그대로 동작
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setMsg("이메일로 로그인 링크를 보냈어. 메일함 확인!");
    } catch (e: any) {
      setMsg(e?.message ?? "로그인 링크 전송 실패");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple" | "twitter") {
    setBusy(true);
    setMsg(null);
    try {
      const redirectTo = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (e: any) {
      setMsg(e?.message ?? "OAuth 실패");
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setMsg(null);
    try {
      await supabase.auth.signOut();
    } finally {
      setBusy(false);
    }
  }

  if (isAuthed) {
    return (
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="text-sm text-zinc-300">
          로그인됨:{" "}
          <span className="text-zinc-100">{user?.email ?? user?.id}</span>
        </div>
        <button
          onClick={logout}
          disabled={busy}
          className="mt-3 rounded-xl border border-zinc-700/70 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div className="text-sm text-zinc-300">작성/댓글은 로그인 필요</div>

      <div className="mt-3 grid gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-700/60"
        />
        <button
          onClick={sendMagicLink}
          disabled={busy || !emailValid}
          className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          {busy ? "처리 중..." : "이메일 링크로 로그인"}
        </button>

        <div className="mt-2 text-xs text-zinc-500">
          글로벌 확장용 소셜 로그인(설정만 하면 바로 작동)
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => oauth("google")}
            disabled={busy}
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60 disabled:opacity-50"
          >
            Google
          </button>
          <button
            onClick={() => oauth("apple")}
            disabled={busy}
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60 disabled:opacity-50"
          >
            Apple
          </button>
          <button
            onClick={() => oauth("twitter")}
            disabled={busy}
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60 disabled:opacity-50"
          >
            X(Twitter)
          </button>
        </div>

        {msg ? <div className="mt-2 text-xs text-zinc-400">{msg}</div> : null}
      </div>
    </div>
  );
}
