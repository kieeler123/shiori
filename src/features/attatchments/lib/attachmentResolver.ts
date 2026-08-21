import type { AttachmentItem } from "@/features/shiori/type";
import { supabase } from "@/lib/supabaseClient";

const ATTACHMENT_PREFIX = "attachment:";

type ResolveAttachmentOptions = {
  expiresIn?: number;
};

export function isAttachmentReference(value: string) {
  return value.startsWith(ATTACHMENT_PREFIX);
}

export function getAttachmentIdFromReference(value: string): string | null {
  if (!isAttachmentReference(value)) {
    return null;
  }

  const attachmentId = value.slice(ATTACHMENT_PREFIX.length).trim();

  return attachmentId || null;
}

export function findAttachmentById(
  attachmentId: string,
  attachments: AttachmentItem[],
) {
  return (
    attachments.find((attachment) => attachment.id === attachmentId) ?? null
  );
}

export async function createAttachmentSignedUrl(
  attachment: AttachmentItem,
  options: ResolveAttachmentOptions = {},
) {
  const expiresIn = options.expiresIn ?? 60 * 60;

  const { data, error } = await supabase.storage
    .from(attachment.bucket)
    .createSignedUrl(attachment.path, expiresIn);

  if (error) {
    throw error;
  }

  if (!data?.signedUrl) {
    throw new Error(
      `첨부파일 Signed URL을 생성하지 못했습니다: ${attachment.name}`,
    );
  }

  return data.signedUrl;
}

export async function resolveAttachmentUrl(
  reference: string,
  attachments: AttachmentItem[],
  options: ResolveAttachmentOptions = {},
): Promise<string | null> {
  const attachmentId = getAttachmentIdFromReference(reference);

  if (!attachmentId) {
    return null;
  }

  const attachment = findAttachmentById(attachmentId, attachments);

  if (!attachment) {
    return null;
  }

  return createAttachmentSignedUrl(attachment, options);
}
