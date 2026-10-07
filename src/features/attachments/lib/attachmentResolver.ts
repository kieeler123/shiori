import type { AttachmentItem } from "@/features/shiori/type";
import { supabase } from "@/lib/supabaseClient";

import { createLocalAttachmentUrl } from "@/features/attachments/local/localAttachmentStore";

const ATTACHMENT_PREFIX = "attachment:";
const DEFAULT_SUPABASE_BUCKET = "log-attachments";

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

/**
 * 기존 데이터에는 storageType이 없으므로
 * undefined는 기존 Supabase 첨부파일로 취급한다.
 */
export function getAttachmentStorageType(
  attachment: AttachmentItem,
): "local" | "supabase" {
  return attachment.storageType ?? "supabase";
}

/**
 * Supabase Storage에 저장된 첨부파일의 Signed URL 생성
 *
 * 기존 데이터 호환:
 * - storageType 없음 -> supabase
 * - bucket 없음 -> log-attachments
 */
export async function createAttachmentSignedUrl(
  attachment: AttachmentItem,
  options: ResolveAttachmentOptions = {},
): Promise<string> {
  const storageType = getAttachmentStorageType(attachment);

  if (storageType !== "supabase") {
    throw new Error(`Supabase 첨부파일이 아닙니다: ${attachment.name}`);
  }

  const bucket = attachment.bucket ?? DEFAULT_SUPABASE_BUCKET;

  if (!attachment.path) {
    throw new Error(`첨부파일 경로가 없습니다: ${attachment.name}`);
  }

  const expiresIn = options.expiresIn ?? 60 * 60;

  const { data, error } = await supabase.storage
    .from(bucket)
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

/**
 * AttachmentItem 자체를 URL로 변환하는 공통 진입점.
 *
 * 현재:
 * - supabase 지원
 *
 * 다음 단계:
 * - local 지원 추가
 */
export async function resolveAttachmentItemUrl(
  attachment: AttachmentItem,
  options: ResolveAttachmentOptions = {},
): Promise<string> {
  const storageType = getAttachmentStorageType(attachment);

  if (storageType === "supabase") {
    return createAttachmentSignedUrl(attachment, options);
  }

  if (storageType === "local") {
    return createLocalAttachmentUrl(attachment);
  }

  throw new Error(`지원하지 않는 첨부파일 저장 방식입니다: ${attachment.name}`);
}

/**
 * 본문의 attachment:<id> 참조를 실제 접근 가능한 URL로 변환
 */
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

  return resolveAttachmentItemUrl(attachment, options);
}
