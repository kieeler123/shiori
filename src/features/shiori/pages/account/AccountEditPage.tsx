import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountProfileCtx } from "@/features/shiori/account/AccountProfileProvider";
import { uploadAvatar } from "@/lib/avatarStorage";

export default function AccountEditPage() {
  const nav = useNavigate();
  const { loading, profile, error, updateProfile, reload } =
    useAccountProfileCtx();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname ?? "");
    setAvatarUrl(profile.avatarUrl ?? "");
    setBio(profile.bio ?? "");
    setWebsite(profile.website ?? "");
    setLocation(profile.location ?? "");
    setLanguage(profile.language ?? "");
    setTimezone(profile.timezone ?? "");
  }, [profile]);

  async function onPickFile(file: File) {
    if (!profile) return;

    setUploading(true);
    const res = await uploadAvatar(profile.userId, file);
    setUploading(false);

    if (!res.ok) {
      alert(res.message);
      return;
    }

    // 업로드 성공 → URL 폼에 반영 (미리보기 즉시 변경)
    setAvatarUrl(res.url);
  }

  async function onSave() {
    if (!profile) return;

    setSaving(true);
    const res = await updateProfile({
      nickname,
      avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      bio,
      website,
      location,
      language,
      timezone,
    });
    setSaving(false);

    if (!res.ok) {
      alert(res.message ?? "저장 실패");
      return;
    }

    alert("저장 완료");
    nav("/settings/account");
  }

  // 안정성: 렌더링 가드
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-6">
        <h1 className="text-xl font-semibold text-zinc-100">프로필 수정</h1>
        <p className="mt-4 text-sm text-zinc-400">불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-6">
        <h1 className="text-xl font-semibold text-zinc-100">프로필 수정</h1>
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
        <h1 className="text-xl font-semibold text-zinc-100">프로필 수정</h1>
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

  const disabled = saving || uploading;

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">프로필 수정</h1>
          <p className="mt-1 text-sm text-zinc-500">
            이 앱에서만 표시되는 프로필을 수정합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => nav("/settings/account")}
          className="rounded-xl border border-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
          disabled={disabled}
        >
          ← 돌아가기
        </button>
      </div>

      <section className="mt-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4">
        {/* preview */}
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="preview"
              className="h-12 w-12 rounded-full border border-zinc-800/60 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-12 w-12 rounded-full border border-zinc-800/60 bg-zinc-900/30" />
          )}
          <div className="text-xs text-zinc-500">미리보기</div>
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="block text-xs text-zinc-500">닉네임</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
              className="mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
              placeholder="닉네임 (2~30자)"
              disabled={disabled}
            />
          </div>

          {/* ✅ 파일 업로드 */}
          <div>
            <label className="block text-xs text-zinc-500">
              썸네일 파일 업로드(avatars bucket)
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={disabled}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                onPickFile(f);
                // 같은 파일 다시 선택 가능하게 reset
                e.currentTarget.value = "";
              }}
              className="mt-2 block w-full text-sm text-zinc-200 file:mr-4 file:rounded-xl file:border file:border-zinc-800/60 file:bg-zinc-950/60 file:px-3 file:py-2 file:text-sm file:text-zinc-200 hover:file:bg-zinc-900/60"
            />
            <p className="mt-1 text-xs text-zinc-600">
              이미지 3MB 이하 권장. 업로드 후 URL이 자동으로 들어갑니다.
            </p>
          </div>

          {/* ✅ URL 입력도 가능 */}
          <div>
            <label className="block text-xs text-zinc-500">
              썸네일 URL(직접 입력)
            </label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
              placeholder="https://..."
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500">소개(bio)</label>
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={120}
              className="mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
              placeholder="한 줄 소개"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500">웹사이트</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
              placeholder="https://..."
              disabled={disabled}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-zinc-500">지역</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
                placeholder="Seoul / Tokyo ..."
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500">언어</label>
              <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
                placeholder="ko / ja / en ..."
                disabled={disabled}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-500">타임존</label>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
                placeholder="Asia/Seoul"
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={disabled}
            className="rounded-xl border border-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60 disabled:opacity-60"
          >
            {saving ? "저장 중..." : uploading ? "업로드 중..." : "저장"}
          </button>

          <button
            type="button"
            onClick={() => nav("/settings/account")}
            disabled={disabled}
            className="rounded-xl border border-zinc-800/60 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60 disabled:opacity-60"
          >
            취소
          </button>

          <span className="text-xs text-zinc-600">
            ※ 소셜 로그인이라 비밀번호 섹션은 없습니다.
          </span>
        </div>
      </section>
    </div>
  );
}
