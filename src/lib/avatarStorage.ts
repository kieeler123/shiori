import { supabase } from "@/lib/supabaseClient";

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<UploadAvatarResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type,
    });

  if (upErr) return { ok: false as const, message: upErr.message };

  const { data } = await supabase.storage.from("avatars").getPublicUrl(path);

  return { ok: true, url: data.publicUrl };
}

export type UploadAvatarResult =
  | {
      ok: true;
      url: string;
    }
  | {
      ok: false;
      message: string;
    };
