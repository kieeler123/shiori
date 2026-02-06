import { useNavigate } from "react-router-dom";
import { useAccountProfileCtx } from "@/features/shiori/account/AccountProfileProvider";

function fmtDate(v: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs text-zinc-200 truncate">{value}</span>
    </div>
  );
}

export default function AccountPage() {
  const nav = useNavigate();
  const { loading, profile, error, reload } = useAccountProfileCtx();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-6">
        <h1 className="text-xl font-semibold text-zinc-100">계정 설정</h1>
        <p className="mt-4 text-sm text-zinc-400">불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-6">
        <h1 className="text-xl font-semibold text-zinc-100">계정 설정</h1>
        <p className="mt-4 text-sm text-red-300">{error}</p>

        <button
          type="button"
          onClick={reload}
          className="mt-4 rounded-xl border border-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-6">
        <h1 className="text-xl font-semibold text-zinc-100">계정 설정</h1>
        <p className="mt-4 text-sm text-zinc-400">로그인이 필요합니다.</p>

        <button
          type="button"
          onClick={() => nav("/auth")}
          className="mt-4 rounded-xl border border-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
        >
          로그인 페이지로 이동
        </button>
      </div>
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
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">계정 설정</h1>
          <p className="mt-1 text-sm text-zinc-500">
            소셜 원본은 유지하고, 앱 내 프로필은 Shiori에서만 수정됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={reload}
          className="rounded-xl border border-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
        >
          새로고침
        </button>
      </div>

      {/* Shiori 프로필 */}
      <section className="mt-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="h-12 w-12 rounded-full border border-zinc-800/60 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-12 w-12 rounded-full border border-zinc-800/60 bg-zinc-900/30" />
          )}

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-zinc-100">
              {nickname}
            </div>
            <div className="truncate text-xs text-zinc-500">
              {location} · {language} · {timezone}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <InfoRow label="소개" value={bio} />
          <InfoRow label="웹사이트" value={website} />
        </div>
      </section>

      {/* 소셜 원본 */}
      <section className="mt-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-4">
        <div className="text-sm font-semibold text-zinc-100">
          소셜 로그인 정보(읽기 전용)
        </div>

        <div className="mt-3 grid gap-2">
          <InfoRow label="Provider" value={authProvider} />
          <InfoRow label="Email" value={authEmail} />
          <InfoRow label="Name" value={authName} />
          <InfoRow label="가입일" value={authCreatedAt} />
          <InfoRow label="최근 로그인" value={authLastSignInAt} />
        </div>

        <p className="mt-3 text-xs text-zinc-600">
          ※ 이메일/비밀번호/구글 사진은 해당 소셜 계정에서 관리됩니다.
        </p>
      </section>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => nav("/settings/account/edit")}
          className="w-full rounded-xl border border-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
        >
          프로필 수정
        </button>

        <button
          type="button"
          onClick={() => nav("/settings/account/delete")}
          className="w-full rounded-xl border border-red-900/40 px-3 py-2 text-sm text-red-200 hover:bg-red-950/30"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
