import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/features/auth/useSession";

export default function AuthButton() {
  const { ready, user, isAuthed } = useSession();

  const btn =
    "inline-flex items-center gap-2 rounded-xl border border-zinc-800/70 bg-zinc-900/50 " +
    "px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-900/80 transition " +
    "focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

  const onLogin = async () => {
    console.log("🟠 login click");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    console.log("🟠 oauth result:", { data, error });
    if (error) alert(`OAuth error: ${error.message}`);
  };

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(`Logout error: ${error.message}`);
  };

  if (!ready) return <div className="text-xs text-zinc-500">세션 확인중…</div>;

  if (!isAuthed || !user) {
    return (
      <button type="button" className={btn} onClick={onLogin}>
        <span className="text-base">🔐</span>
        로그인
      </button>
    );
  }

  const meta = user.user_metadata as any;
  const avatarUrl: string | undefined = meta?.avatar_url || meta?.picture;
  const name: string =
    meta?.full_name || meta?.name || user.email?.split("@")[0] || "user";

  return (
    <button type="button" className={btn} onClick={onLogout} title="로그아웃">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          className="h-6 w-6 rounded-full border border-zinc-700/70"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-zinc-800/70 grid place-items-center text-xs">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <span className="max-w-[120px] truncate text-zinc-100">{name}</span>
      <span className="text-zinc-400 text-xs">Logout</span>
    </button>
  );
}
