import { useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { buildNext } from "@/lib/authRedirect";
import { startGoogleLogin, logout } from "@/lib/authActions";

import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { Button } from "@/shared/ui/primitives/Button";

export default function AuthPanel() {
  const { isAuthed, user } = useSession();
  const location = useLocation();
  const next = buildNext(location.pathname, location.search);

  if (isAuthed) {
    return (
      <SurfaceCard className="p-4 space-y-3">
        <div className="text-sm t4">
          로그인됨: <span className="t2">{user?.email ?? user?.id}</span>
        </div>

        <Button
          variant="outline"
          onClick={() => logout().catch((e) => alert(e.message))}
        >
          로그아웃
        </Button>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="p-4 space-y-3">
      <div className="text-sm t4">작성/댓글은 로그인 필요</div>

      <Button
        variant="primary"
        onClick={() => startGoogleLogin(next).catch((e) => alert(e.message))}
      >
        Google로 로그인
      </Button>
    </SurfaceCard>
  );
}
