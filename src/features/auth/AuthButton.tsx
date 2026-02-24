import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { startGoogleLogin } from "@/lib/authActions";
import { buildNext } from "@/lib/authRedirect";
import { useAccountProfileCtx } from "@/features/shiori/account/AccountProfileProvider";
import { Button } from "@/shared/ui/primitives/Button";
import { UserChipButton } from "@/shared/ui/patterns/UserChipButton";
import { cn } from "@/shared/ui/utils/cn";
import {
  isInAppBrowser,
  openExternalTry,
} from "@/shared/ui/utils/inAppBrowser";
import { toastAction } from "@/app/layout/toast";

type Props = {
  /** sm 미만에서 아이콘-only로 보여줄지 */
  compactOnMobile?: boolean;
  /** 아이콘-only일 때 aria-label */
  mobileLabel?: string;
};

function openInExternalBrowser() {
  // 인앱에서 완벽히 강제는 불가. 그래도 시도는 가능.
  window.open(window.location.href, "_blank", "noopener,noreferrer");
}

export default function AuthButton({
  compactOnMobile = true,
  mobileLabel = "로그인/계정",
}: Props) {
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

  // ✅ 로그인 상태: 데스크탑=UserChip / 모바일=아바타 아이콘 버튼
  if (isAuthed) {
    return (
      <>
        {/* Mobile: icon-only */}
        {compactOnMobile ? (
          <Button
            variant="icon"
            aria-label={mobileLabel}
            title="계정 설정"
            onClick={() => nav("/settings/account")}
            className="sm:hidden"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <span aria-hidden="true">👤</span>
            )}
          </Button>
        ) : null}

        {/* Desktop: full chip */}
        <div className={cn(compactOnMobile ? "hidden sm:block" : "block")}>
          <UserChipButton
            nickname={nickname}
            avatarUrl={avatarUrl}
            title="계정 설정"
            onClick={() => nav("/settings/account")}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {compactOnMobile ? (
        <Button
          variant="ghost"
          size="sm"
          title="로그인"
          onClick={() => {
            if (isInAppBrowser()) {
              toastAction(
                "인앱 브라우저에서는 Google 로그인이 제한될 수 있어요. Chrome/Safari에서 다시 시도해주세요.",
                "info",
                { label: "브라우저에서 열기", onClick: openExternalTry },
              );
              return;
            }
            startGoogleLogin(next).catch((e) =>
              toastAction(e.message, "error", {
                label: "닫기",
                onClick: () => {},
              }),
            );
          }}
        >
          🔐 로그인
        </Button>
      ) : null}

      <Button
        variant="ghost"
        size="sm"
        title="로그인"
        onClick={() => startGoogleLogin(next).catch((e) => alert(e.message))}
        className={compactOnMobile ? "hidden sm:inline-flex" : "inline-flex"}
      >
        🔐 로그인
      </Button>
    </>
  );
}
