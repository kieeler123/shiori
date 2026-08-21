import type { AttachmentItem } from "@/features/shiori/type";
import { supabase } from "@/lib/supabaseClient";

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

export async function uploadAttachment(
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
    path: storagePath,
    name: file.name,
    mimeType: contentType,
    size: file.size,
    bucket: bucketName,
    publicUrl: publicUrlData.publicUrl ?? null,
  };
}
