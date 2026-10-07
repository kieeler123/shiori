import type { AttachmentItem } from "@/features/shiori/type";

import { supabase } from "@/lib/supabaseClient";

import { getAttachmentStorageType } from "@/features/attachments/lib/attachmentStorageType";

import { deleteLocalAttachment } from "@/features/attachments/local/localAttachmentStore";

const DEFAULT_ATTACHMENT_BUCKET = "log-attachments";

export async function deleteAttachment(
  attachment: AttachmentItem,
): Promise<void> {
  const storageType = getAttachmentStorageType(attachment);

  if (storageType === "local") {
    await deleteLocalAttachment(attachment);
    return;
  }

  const bucket = attachment.bucket ?? DEFAULT_ATTACHMENT_BUCKET;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([attachment.path]);

  if (error) {
    throw new Error(`첨부파일 삭제에 실패했습니다: ${attachment.name}`, {
      cause: error,
    });
  }
}
