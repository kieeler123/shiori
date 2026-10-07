import type { AttachmentItem } from "@/features/shiori/type";

export type AttachmentStorageType = "local" | "supabase";

export function getAttachmentStorageType(
  attachment: AttachmentItem,
): AttachmentStorageType {
  return attachment.storageType ?? "supabase";
}
