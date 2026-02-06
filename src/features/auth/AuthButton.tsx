import { useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { startGoogleLogin, logout } from "@/lib/authActions";
import { buildNext } from "@/lib/authRedirect";
import { btn } from "@/app/ui/btn";
import { useAccountProfileCtx } from "@/features/shiori/account/AccountProfileProvider";

export default function AuthButton() {
  const { ready, isAuthed } = useSession();
  const location = useLocation();
  const next = buildNext(location.pathname, location.search);

  // ✅ 훅은 항상 호출 (Rules of Hooks)
  const { profile } = useAccountProfileCtx();

  const nickname = profile?.nickname ?? "User";
  const avatarUrl = profile?.avatarUrl ?? "";

  if (!ready) return <div className="text-xs text-zinc-500">세션 확인중…</div>;

  // ✅ 로그인 상태면: 썸네일+닉네임+로그아웃
  if (isAuthed) {
    return (
      <button
        type="button"
        className={btn}
        onClick={() => logout().catch((e) => alert(e.message))}
        title="로그아웃"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="h-7 w-7 rounded-full border border-zinc-800/60 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-7 w-7 rounded-full border border-zinc-800/60 bg-zinc-900/30" />
        )}
        <span className="max-w-[120px] truncate text-zinc-100">{nickname}</span>
        <span className="text-zinc-400 text-xs">Logout</span>
      </button>
    );
  }

  // ✅ 비로그인이면: 로그인 버튼
  return (
    <button
      type="button"
      className={btn}
      onClick={() => startGoogleLogin(next).catch((e) => alert(e.message))}
      title="로그인"
    >
      🔐 로그인
    </button>
  );
}
