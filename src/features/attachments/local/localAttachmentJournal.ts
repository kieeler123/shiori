import type { AttachmentItem } from "@/features/shiori/type";

import {
  getPendingAttachments,
  removePendingAttachment,
  savePendingAttachment,
} from "./localDirectoryDb";

export async function markLocalAttachmentPending(
  attachment: AttachmentItem,
): Promise<void> {
  if ((attachment.storageType ?? "supabase") !== "local") {
    return;
  }

  await savePendingAttachment(attachment);
}

export async function clearLocalAttachmentPending(
  attachmentId: string,
): Promise<void> {
  await removePendingAttachment(attachmentId);
}

export async function listPendingLocalAttachments() {
  return getPendingAttachments();
}
