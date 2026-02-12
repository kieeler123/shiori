import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAccountProfileCtx } from "@/features/shiori/account/AccountProfileProvider";
import { uploadAvatar } from "@/lib/avatarStorage";

import { PageContainer } from "@/app/layout/PageContainer";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { Button } from "@/shared/ui/primitives/Button";

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

  const disabled = saving || uploading;

  async function onPickFile(file: File) {
    if (!profile) return;

    setUploading(true);
    try {
      const res = await uploadAvatar(profile.userId, file);

      if (!res.ok) {
        alert(res.message);
        return;
      }

      // 업로드 성공 → URL 폼에 반영 (미리보기 즉시 변경)
      setAvatarUrl(res.url);
    } catch (e) {
      console.error("avatar upload failed:", e);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function onSave() {
    if (!profile) return;

    setSaving(true);
    try {
      const res = await updateProfile({
        nickname,
        avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
        bio,
        website,
        location,
        language,
        timezone,
      });

      if (!res.ok) {
        alert(res.message ?? "저장 실패");
        return;
      }

      alert("저장 완료");
      nav("/settings/account");
    } catch (e) {
      console.error("profile save failed:", e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ 입력 UI 통일(필요하면 나중에 shared Input 컴포넌트로 빼도 됨)
  const field =
    "mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60";

  // --- Guards ---
  if (loading) {
    return (
      <PageContainer className="space-y-4">
        <SurfaceCard className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-100">프로필 수정</h1>
          <p className="text-sm text-zinc-400">불러오는 중…</p>
        </SurfaceCard>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="space-y-4">
        <SurfaceCard className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-zinc-100">프로필 수정</h1>
            <p className="text-sm text-red-300">{error}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="soft" onClick={reload}>
              다시 시도
            </Button>
            <Button variant="nav" onClick={() => nav("/settings/account")}>
              ← 돌아가기
            </Button>
          </div>
        </SurfaceCard>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer className="space-y-4">
        <SurfaceCard className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-zinc-100">프로필 수정</h1>
            <p className="text-sm text-zinc-400">로그인이 필요합니다.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="soft" onClick={() => nav("/auth")}>
              로그인 페이지로 이동
            </Button>
            <Button variant="nav" onClick={() => nav("/settings/account")}>
              ← 돌아가기
            </Button>
          </div>
        </SurfaceCard>
      </PageContainer>
    );
  }

  // --- Main ---
  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <SurfaceCard className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-100">프로필 수정</h1>
          <p className="text-sm text-zinc-500">
            이 앱에서만 표시되는 프로필을 수정합니다.
          </p>
        </div>

        <Button
          onClick={() => nav("/settings/account")}
          variant="nav"
          disabled={disabled}
        >
          ← 돌아가기
        </Button>
      </SurfaceCard>

      {/* Form */}
      <SurfaceCard className="p-4">
        {/* Preview */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="preview"
                className="h-12 w-12 rounded-full border border-zinc-700/60 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-12 w-12 rounded-full border border-zinc-700/60 bg-zinc-950/40" />
            )}
            <div className="text-xs text-zinc-500">미리보기</div>
          </div>

          {uploading ? (
            <div className="text-xs text-zinc-400">업로드 중…</div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="block text-xs text-zinc-500">닉네임</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
              className={field}
              placeholder="닉네임 (2~30자)"
              disabled={disabled}
            />
          </div>

          {/* 파일 업로드 */}
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
                e.currentTarget.value = "";
              }}
              className="mt-2 block w-full text-sm text-zinc-200 file:mr-4 file:rounded-xl file:border file:border-zinc-800/60 file:bg-zinc-950/50 file:px-3 file:py-2 file:text-sm file:text-zinc-200 hover:file:bg-zinc-900/60"
            />
            <p className="mt-1 text-xs text-zinc-600">
              이미지 3MB 이하 권장. 업로드 후 URL이 자동으로 들어갑니다.
            </p>
          </div>

          {/* URL 입력 */}
          <div>
            <label className="block text-xs text-zinc-500">
              썸네일 URL(직접 입력)
            </label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className={field}
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
              className={field}
              placeholder="한 줄 소개"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500">웹사이트</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={field}
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
                className={field}
                placeholder="Seoul / Tokyo ..."
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500">언어</label>
              <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={field}
                placeholder="ko / ja / en ..."
                disabled={disabled}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-500">타임존</label>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={field}
                placeholder="Asia/Seoul"
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="soft" onClick={onSave} disabled={disabled}>
            {saving ? "저장 중..." : "저장"}
          </Button>

          <Button
            variant="soft"
            onClick={() => nav("/settings/account")}
            disabled={disabled}
          >
            취소
          </Button>

          <span className="text-xs text-zinc-700">
            ※ 소셜 로그인이라 비밀번호 섹션은 없습니다.
          </span>
        </div>
      </SurfaceCard>
    </PageContainer>
  );
}
