import { useNavigate } from "react-router-dom";
import { useAccountProfileCtx } from "@/features/shiori/account/AccountProfileProvider";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { Button } from "@/shared/ui/primitives/Button";
import { logout } from "@/lib/authActions";

function fmtDate(v: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="
        flex items-center justify-between gap-3
        rounded-xl px-3 py-2
        border border-[var(--border-soft)]
        bg-[var(--bg-elev-2)]
      "
    >
      <span className="text-xs t6">{label}</span>
      <span className="text-xs t3 truncate">{value}</span>
    </div>
  );
}

export default function AccountOverviewPage() {
  const nav = useNavigate();
  const { loading, profile, error, reload } = useAccountProfileCtx();

  async function handleLogout() {
    if (!confirm("로그아웃 하시겠습니까?")) return;
    await logout();
    nav("/", { replace: true });
  }

  if (loading) {
    return (
      <SurfaceCard className="space-y-2">
        <p className="text-sm t5">불러오는 중...</p>
      </SurfaceCard>
    );
  }

  if (error) {
    return (
      <SurfaceCard className="space-y-3">
        <p className="text-sm text-[var(--btn-danger-fg)]">{error}</p>
        <div className="flex items-center gap-2">
          <Button variant="soft" onClick={reload}>
            다시 시도
          </Button>
        </div>
      </SurfaceCard>
    );
  }

  if (!profile) {
    return (
      <SurfaceCard className="space-y-3">
        <p className="text-sm t5">로그인이 필요합니다.</p>
        <div className="flex items-center gap-2">
          <Button variant="soft" onClick={() => nav("/auth")}>
            로그인 페이지로 이동
          </Button>
        </div>
      </SurfaceCard>
    );
  }

  const nickname = profile.nickname || "User";
  const avatarUrl = profile.avatarUrl ?? "";
  const bio = profile.bio || "-";
  const website = profile.website || "-";
  const location = profile.location || "-";
  const language = profile.language || "-";
  const timezone = profile.timezone || "-";

  const authProvider = profile.auth.provider ?? "-";
  const authEmail = profile.auth.email ?? "-";
  const authName = profile.auth.name ?? "-";
  const authCreatedAt = fmtDate(profile.auth.createdAt);
  const authLastSignInAt = fmtDate(profile.auth.lastSignInAt);

  return (
    <>
      {/* Shiori 프로필 */}
      <SurfaceCard className="p-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="h-12 w-12 rounded-full border border-[var(--border-soft)] object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-12 w-12 rounded-full border border-[var(--border-soft)] bg-[var(--bg-elev-2)]" />
          )}

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold t2">{nickname}</div>
            <div className="truncate text-xs t6">
              {location} · {language} · {timezone}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <InfoRow label="소개" value={bio} />
          <InfoRow label="웹사이트" value={website} />
        </div>
      </SurfaceCard>

      {/* 소셜 원본 */}
      <SurfaceCard className="p-4">
        <div className="text-sm font-semibold t2">
          소셜 로그인 정보(읽기 전용)
        </div>

        <div className="mt-3 grid gap-2">
          <InfoRow label="Provider" value={authProvider} />
          <InfoRow label="Email" value={authEmail} />
          <InfoRow label="Name" value={authName} />
          <InfoRow label="가입일" value={authCreatedAt} />
          <InfoRow label="최근 로그인" value={authLastSignInAt} />
        </div>

        <p className="mt-3 text-xs t6">
          ※ 이메일/비밀번호/구글 사진은 해당 소셜 계정에서 관리됩니다.
        </p>
      </SurfaceCard>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="soft"
          size="md"
          className="w-full"
          onClick={() => nav("/settings/account/edit")}
        >
          프로필 수정
        </Button>

        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={handleLogout}
        >
          로그아웃
        </Button>

        <Button
          variant="danger"
          size="md"
          className="w-full"
          onClick={() => nav("/settings/account/delete")}
        >
          회원 탈퇴
        </Button>
      </div>
    </>
  );
}
