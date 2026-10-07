import type { AttachmentItem } from "@/features/shiori/type";

import { supabase } from "@/lib/supabaseClient";

import {
  deleteLocalAttachment,
  saveLocalAttachment,
} from "@/features/attachments/local/localAttachmentStore";

import {
  listPendingLocalAttachments,
  markLocalAttachmentPending,
} from "@/features/attachments/local/localAttachmentJournal";

const DEFAULT_BUCKET_NAME = "log-attachments";
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const;

const ACCEPTED_MIME_PREFIXES = ["image/"] as const;

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

type UploadAttachmentOptions = {
  bucketName?: string;
};

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex < 0) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

function isAcceptedFile(file: File) {
  const extension = getFileExtension(file.name);

  const hasAllowedExtension = ACCEPTED_EXTENSIONS.some(
    (acceptedExtension) => acceptedExtension === extension,
  );

  const hasAllowedMimeType =
    ACCEPTED_MIME_TYPES.some(
      (acceptedMimeType) => acceptedMimeType === file.type,
    ) || ACCEPTED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix));

  return hasAllowedExtension || hasAllowedMimeType;
}

function validateFile(file: File) {
  if (!isAcceptedFile(file)) {
    throw new Error(
      [
        `지원하지 않는 파일 형식입니다: ${file.name}`,
        `허용 형식: ${ACCEPTED_EXTENSIONS.join(", ")}`,
      ].join("\n"),
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `파일 용량 제한을 초과했습니다: ${file.name} ` +
        `(최대 ${MAX_FILE_SIZE_MB}MB)`,
    );
  }
}

function buildStoragePath(file: File) {
  const extension = getFileExtension(file.name);
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  return ["logs", yyyy, mm, dd, `${crypto.randomUUID()}${extension}`].join("/");
}

function getUploadContentType(file: File) {
  const extension = getFileExtension(file.name);

  if (extension === ".md") {
    return "text/markdown; charset=utf-8";
  }

  if (extension === ".txt") {
    return "text/plain; charset=utf-8";
  }

  return file.type || "application/octet-stream";
}

/**
 * 신규 첨부파일의 기본 저장 경로.
 *
 * Shiori는 신규 일반 첨부파일을 Local Disk에 저장한다.
 * Supabase Storage로 자동 fallback하지 않는다.
 */
export async function uploadAttachment(file: File): Promise<AttachmentItem> {
  validateFile(file);

  const attachment = await saveLocalAttachment(file);

  console.log("[attachment] local saved", attachment);

  try {
    console.log("[attachment] marking pending", attachment.id);

    await markLocalAttachmentPending(attachment);

    console.log("[attachment] pending saved", attachment.id);

    const pending = await listPendingLocalAttachments();

    console.log("[attachment] pending records", pending);

    return attachment;

    console.log("[attachment] pending saved", attachment.id);

    return attachment;
  } catch (error) {
    // ...
  }

  try {
    await markLocalAttachmentPending(attachment);

    return attachment;
  } catch (error) {
    try {
      await deleteLocalAttachment(attachment);
    } catch (rollbackError) {
      console.error("[uploadAttachment] local rollback failed:", {
        attachmentId: attachment.id,
        attachmentName: attachment.name,
        rollbackError,
      });
    }

    throw error;
  }
}

/**
 * 명시적으로 Supabase Storage에 첨부파일을 저장해야 할 때 사용한다.
 *
 * 기존 Cloud 업로드 기능 보존용이며,
 * uploadAttachment()의 자동 fallback으로 사용하지 않는다.
 */
export async function uploadSupabaseAttachment(
  file: File,
  options: UploadAttachmentOptions = {},
): Promise<AttachmentItem> {
  validateFile(file);

  const bucketName = options.bucketName ?? DEFAULT_BUCKET_NAME;

  const storagePath = buildStoragePath(file);
  const contentType = getUploadContentType(file);

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(storagePath);

  return {
    id: crypto.randomUUID(),
    storageType: "supabase",
    path: storagePath,
    name: file.name,
    mimeType: contentType,
    size: file.size,
    bucket: bucketName,
    publicUrl: publicUrlData.publicUrl ?? null,
  };
}
