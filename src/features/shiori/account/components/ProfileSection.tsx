import { useEffect, useMemo, useState } from "react";
import { useAccountProfile } from "@/features/shiori/account/hooks/useAccountProfile";

function fmtDate(v: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs text-zinc-200 truncate">{value}</span>
    </div>
  );
}

export default async function ProfileSection() {
  const { loading, profile, error, reload } = useAccountProfile();

  const [nickname, setNickname] = useState("");
  const { updateProfile } = useAccountProfile();
  await updateProfile({ nickname });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname ?? "");
  }, [profile]);

  const readOnlyInfo = useMemo(() => {
    if (!profile) return null;
    return {
      provider: profile.auth?.provider ?? "-",
      email: profile.auth?.email ?? "-",
      displayName: profile.auth?.name ?? "-",
      createdAt: fmtDate(profile.auth?.createdAt),
      lastSignInAt: fmtDate(profile.auth?.lastSignInAt),
    };
  }, [profile]);

  async function onSave() {
    if (!profile) return;

    setSaving(true);
    const res = await updateProfile({ nickname });
    setSaving(false);

    if (!res.ok) return alert(res.message ?? "저장 실패");
    alert("닉네임 저장 완료");
  }

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">프로필</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Google 로그인 계정 정보(읽기 전용) + Shiori 닉네임(수정 가능)
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

      {loading ? (
        <p className="mt-4 text-sm text-zinc-400">불러오는 중...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-300">{error}</p>
      ) : !profile ? (
        <p className="mt-4 text-sm text-zinc-400">로그인이 필요합니다.</p>
      ) : (
        <>
          {/* 상단: 아바타 + 기본 표시 */}
          <div className="mt-4 flex items-center gap-3">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="avatar"
                className="h-12 w-12 rounded-full border border-zinc-800/60 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-12 w-12 rounded-full border border-zinc-800/60 bg-zinc-900/30" />
            )}

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-100">
                {profile.auth?.name ?? "Google User"}
              </div>
              <div className="truncate text-xs text-zinc-500">
                {profile.auth?.email ?? "-"} ·{" "}
                {profile.auth?.provider ?? "google"}
              </div>
            </div>
          </div>

          {/* 읽기 전용 정보 */}
          {readOnlyInfo && (
            <div className="mt-4 grid gap-2">
              <InfoRow label="로그인 방식" value={readOnlyInfo.provider} />
              <InfoRow label="이메일" value={readOnlyInfo.email} />
              <InfoRow label="구글 이름" value={readOnlyInfo.displayName} />
              <InfoRow label="가입일" value={readOnlyInfo.createdAt} />
              <InfoRow label="최근 로그인" value={readOnlyInfo.lastSignInAt} />
            </div>
          )}

          {/* 닉네임 수정 */}
          <div className="mt-5">
            <label className="block text-xs text-zinc-500">Shiori 닉네임</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
              placeholder="닉네임 (2~30자)"
              maxLength={30}
            />

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="rounded-xl border border-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60 disabled:opacity-60"
              >
                {saving ? "저장 중..." : "저장"}
              </button>

              <span className="text-xs text-zinc-600">
                ※ 소셜 로그인이라 비밀번호 변경 섹션은 없습니다.
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
