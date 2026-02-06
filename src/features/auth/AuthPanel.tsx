import { useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { buildNext } from "@/lib/authRedirect";
import { startGoogleLogin, logout } from "@/lib/authActions";

export default function AuthPanel() {
  const { isAuthed, user } = useSession();
  const location = useLocation();
  const next = buildNext(location.pathname, location.search);

  if (isAuthed) {
    return (
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="text-sm text-zinc-300">
          로그인됨:{" "}
          <span className="text-zinc-100">{user?.email ?? user?.id}</span>
        </div>
        <button
          onClick={() => logout().catch((e) => alert(e.message))}
          className="mt-3 rounded-xl border border-zinc-700/70 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div className="text-sm text-zinc-300 mb-3">작성/댓글은 로그인 필요</div>
      <button
        onClick={() => startGoogleLogin(next).catch((e) => alert(e.message))}
        className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
      >
        Google로 로그인
      </button>
    </div>
  );
}
