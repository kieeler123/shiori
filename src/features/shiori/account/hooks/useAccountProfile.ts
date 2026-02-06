import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type {
  AppProfile,
  AppProfilePatch,
  ProfileRow,
} from "@/features/shiori/type";

function pickName(meta: Record<string, any>) {
  return (
    meta.full_name ??
    meta.name ??
    meta.user_name ??
    meta.preferred_username ??
    null
  );
}
function pickAvatar(meta: Record<string, any>) {
  return meta.avatar_url ?? meta.picture ?? null;
}
function s(v: unknown) {
  return typeof v === "string" ? v : "";
}

function normalizeProfileRow(raw: any): ProfileRow | null {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.id !== "string") return null;
  return {
    id: raw.id,
    nickname:
      typeof raw.nickname === "string" ? raw.nickname : (raw.nickname ?? null),
    avatar_url:
      typeof raw.avatar_url === "string"
        ? raw.avatar_url
        : (raw.avatar_url ?? null),
    bio: typeof raw.bio === "string" ? raw.bio : (raw.bio ?? null),
    website:
      typeof raw.website === "string" ? raw.website : (raw.website ?? null),
    location:
      typeof raw.location === "string" ? raw.location : (raw.location ?? null),
    language:
      typeof raw.language === "string" ? raw.language : (raw.language ?? null),
    timezone:
      typeof raw.timezone === "string" ? raw.timezone : (raw.timezone ?? null),
  };
}

export function useAccountProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: userRes, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;

      const user = userRes?.user;
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const meta = (user.user_metadata ?? {}) as Record<string, any>;
      const provider = user.app_metadata?.provider ?? null;

      const authName = pickName(meta);
      const authAvatarUrl = pickAvatar(meta);
      const authEmail = user.email ?? null;
      const createdAt = (user as any).created_at ?? null;
      const lastSignInAt = (user as any).last_sign_in_at ?? null;

      const { data, error: pErr } = await supabase
        .from("profiles")
        .select(
          "id, nickname, avatar_url, bio, website, location, language, timezone",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (pErr) throw pErr;

      let row = normalizeProfileRow(data);

      // 최초 로그인 seed
      if (!row) {
        const seedNickname = String(authName ?? "User").slice(0, 30);

        const { error: upErr } = await supabase.from("profiles").upsert(
          {
            id: user.id,
            nickname: seedNickname,
            avatar_url: authAvatarUrl,
            bio: "",
            website: "",
            location: "",
            language: "",
            timezone: "",
          },
          { onConflict: "id" },
        );
        if (upErr) throw upErr;

        row = {
          id: user.id,
          nickname: seedNickname,
          avatar_url: authAvatarUrl,
          bio: "",
          website: "",
          location: "",
          language: "",
          timezone: "",
        };
      }

      const nickname =
        s(row.nickname) || String(authName ?? "User").slice(0, 30);
      const avatarUrl = row.avatar_url ?? authAvatarUrl;

      setProfile({
        userId: user.id,
        nickname,
        avatarUrl,
        bio: s(row.bio),
        website: s(row.website),
        location: s(row.location),
        language: s(row.language),
        timezone: s(row.timezone),
        auth: {
          provider,
          email: authEmail,
          name: authName,
          avatarUrl: authAvatarUrl,
          createdAt,
          lastSignInAt,
        },
      });

      setLoading(false);
    } catch (e: any) {
      setError(e?.message ?? "프로필을 불러오지 못했습니다.");
      setProfile(null);
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (patch: AppProfilePatch) => {
      if (!profile)
        return { ok: false as const, message: "로그인이 필요합니다." };

      const nextNickname = patch.nickname?.trim();
      if (nextNickname !== undefined) {
        if (nextNickname.length < 2)
          return { ok: false as const, message: "닉네임은 2자 이상" };
        if (nextNickname.length > 30)
          return { ok: false as const, message: "닉네임은 30자 이하" };
      }

      const payload: Record<string, any> = {};
      if (patch.nickname !== undefined)
        payload.nickname = patch.nickname.trim();
      if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl;
      if (patch.bio !== undefined) payload.bio = patch.bio.trim();
      if (patch.website !== undefined) payload.website = patch.website.trim();
      if (patch.location !== undefined)
        payload.location = patch.location.trim();
      if (patch.language !== undefined)
        payload.language = patch.language.trim();
      if (patch.timezone !== undefined)
        payload.timezone = patch.timezone.trim();

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", profile.userId);
      if (error) return { ok: false as const, message: error.message };

      // ✅ 타입 any 문제도 없애기: prev 타입 명시
      setProfile((prev: AppProfile | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          nickname:
            patch.nickname !== undefined
              ? patch.nickname.trim()
              : prev.nickname,
          avatarUrl:
            patch.avatarUrl !== undefined ? patch.avatarUrl : prev.avatarUrl,
          bio: patch.bio !== undefined ? patch.bio.trim() : prev.bio,
          website:
            patch.website !== undefined ? patch.website.trim() : prev.website,
          location:
            patch.location !== undefined
              ? patch.location.trim()
              : prev.location,
          language:
            patch.language !== undefined
              ? patch.language.trim()
              : prev.language,
          timezone:
            patch.timezone !== undefined
              ? patch.timezone.trim()
              : prev.timezone,
        };
      });

      return { ok: true as const };
    },
    [profile],
  );

  const updateNickname = useCallback(
    async (nickname: string) => updateProfile({ nickname }),
    [updateProfile],
  );

  // ✅ 핵심: 로그인/로그아웃 변화 자동 반영
  useEffect(() => {
    // 최초 로드
    reload();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null);
        setLoading(false);
        setError(null);
        return;
      }
      // 로그인/토큰갱신 등 -> 다시 로드
      reload();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [reload]);

  return { loading, profile, error, reload, updateProfile, updateNickname };
}
