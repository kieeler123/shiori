import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { buildNext } from "@/lib/authRedirect";
import { startGoogleLogin, logout } from "@/lib/authActions";

import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { Button } from "@/shared/ui/primitives/Button";
import { toast } from "@/app/layout/toast";
import { useI18n } from "@/shared/i18n/LocaleProvider";

type Props = {
  next?: string; // next 강제 지정(없으면 buildNext 사용)
  mode?: "card" | "compact"; // AuthBar 대체
  showHint?: boolean; // "작성/댓글은 로그인 필요" 같은 힌트 표시 여부
};

export default function AuthPanel({
  next,
  mode = "card",
  showHint = true,
}: Props) {
  const { t } = useI18n();
  const { isAuthed, user } = useSession();
  const location = useLocation();
  const nav = useNavigate();

  const computedNext = next ?? buildNext(location.pathname, location.search);

  async function handleLogin() {
    try {
      await startGoogleLogin(computedNext);
    } catch (e: any) {
      toast(String(e?.message ?? e), "error");
    }
  }

  async function handleLogout() {
    try {
      await logout();
      toast(t("common.auth.loggedOut"), "success");
      // 로그아웃 후 현재 페이지 유지(선택)
      nav(location.pathname + location.search, { replace: true });
    } catch (e: any) {
      toast(String(e?.message ?? e), "error");
    }
  }

  // ✅ compact 모드: 버튼만
  if (mode === "compact") {
    if (isAuthed) return null;
    return (
      <Button variant="primary" size="md" onClick={handleLogin}>
        {t("common.auth.loginWithGoogle")}
      </Button>
    );
  }

  // ✅ card 모드: 지금 UI 유지
  if (isAuthed) {
    return (
      <SurfaceCard className="p-4 space-y-3">
        <div className="text-sm t4">
          {t("auth.signedInAs")}{" "}
          <span className="t2">{user?.email ?? user?.id}</span>
        </div>

        <Button variant="outline" onClick={handleLogout}>
          {t("common.auth.logout")}
        </Button>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="p-4 space-y-3">
      {showHint ? (
        <div className="text-sm t4">{t("auth.loginRequired")}</div>
      ) : null}

      <Button variant="primary" onClick={handleLogin}>
        {t("common.auth.loginWithGoogle")}
      </Button>
    </SurfaceCard>
  );
}
