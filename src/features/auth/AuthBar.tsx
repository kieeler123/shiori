import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { startGoogleLogin } from "@/lib/authActions";
import { Button } from "@/shared/ui/primitives/Button";

export default function AuthBar({ next }: { next: string }) {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  useEffect(() => {
    if (!ready) return;
    if (isAuthed) nav(next, { replace: true });
  }, [ready, isAuthed, next, nav]);

  if (!ready) return <div className="text-sm t5">세션 확인중…</div>;

  return (
    <Button
      variant="primary"
      size="md"
      onClick={() => startGoogleLogin(next).catch((e) => alert(e.message))}
    >
      Google로 로그인
    </Button>
  );
}
