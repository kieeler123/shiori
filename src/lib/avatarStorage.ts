import { supabase } from "@/lib/supabaseClient";

export async function uploadAvatar(userId: string, file: File) {
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

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = data.publicUrl;

  return { ok: true as const, url };
}
