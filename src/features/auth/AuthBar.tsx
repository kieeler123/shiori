import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { startGoogleLogin } from "@/lib/authActions";

export default function AuthBar({ next }: { next: string }) {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  useEffect(() => {
    if (!ready) return;
    if (isAuthed) nav(next, { replace: true });
  }, [ready, isAuthed, next, nav]);

  if (!ready) return <div className="text-sm text-zinc-400">세션 확인중…</div>;

  return (
    <button
      type="button"
      onClick={() => startGoogleLogin(next).catch((e) => alert(e.message))}
      className="cursor-pointer rounded-xl border border-zinc-800/60 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
    >
      Google로 로그인
    </button>
  );
}
