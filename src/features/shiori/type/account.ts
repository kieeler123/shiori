export type ProfileRow = {
  id: string;
  nickname: string | null;

  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  language: string | null;
  timezone: string | null;
};

export type AppProfile = {
  userId: string;

  // 앱에서 보여줄/수정할 값 (profiles = SSOT)
  nickname: string;
  avatarUrl: string | null;
  bio: string;
  website: string;
  location: string;
  language: string;
  timezone: string;

  // 참고용(읽기 전용): 소셜 원본
  auth: {
    provider: string | null;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
    createdAt: string | null;
    lastSignInAt: string | null;
  };
};

export type AppProfilePatch = Partial<
  Pick<
    AppProfile,
    | "nickname"
    | "avatarUrl"
    | "bio"
    | "website"
    | "location"
    | "language"
    | "timezone"
  >
>;

export type UpdateResult = { ok: true } | { ok: false; message: string };

export type AccountProfileCtxValue = {
  loading: boolean;
  profile: AppProfile | null;
  error: string | null;
  reload: () => Promise<void>;
  updateProfile: (patch: AppProfilePatch) => Promise<UpdateResult>;
  updateNickname: (nickname: string) => Promise<UpdateResult>;
};

export type OAuthProvider = "google" | "apple" | "twitter";
