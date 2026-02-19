import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { startGoogleLogin } from "@/lib/authActions";
import { buildNext } from "@/lib/authRedirect";
import { useAccountProfileCtx } from "@/features/shiori/account/AccountProfileProvider";
import { Button } from "@/shared/ui/primitives/Button";
import { UserChipButton } from "@/shared/ui/patterns/UserChipButton";

export default function AuthButton() {
  const { ready, isAuthed } = useSession();
  const location = useLocation();
  const nav = useNavigate();

  const next = buildNext(location.pathname, location.search);

  // ✅ 훅은 항상 호출
  const { profile } = useAccountProfileCtx();
  const nickname = profile?.nickname ?? "User";
  const avatarUrl = profile?.avatarUrl ?? "";

  if (!ready) {
    return <div className="text-xs text-[var(--text-6)]">세션 확인중…</div>;
  }

  if (isAuthed) {
    return (
      <UserChipButton
        nickname={nickname}
        avatarUrl={avatarUrl}
        title="계정 설정"
        onClick={() => nav("/settings/account")}
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      title="로그인"
      onClick={() => startGoogleLogin(next).catch((e) => alert(e.message))}
    >
      🔐 로그인
    </Button>
  );
}
