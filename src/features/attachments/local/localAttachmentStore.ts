import type { AttachmentItem } from "@/features/shiori/type";

import { getUsableAttachmentRootDirectory } from "./localDirectory";

const ATTACHMENTS_DIRECTORY = "attachments";

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

function getDateParts(date = new Date()) {
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    day: String(date.getDate()).padStart(2, "0"),
  };
}

async function requireRootDirectory(): Promise<FileSystemDirectoryHandle> {
  const root = await getUsableAttachmentRootDirectory();

  if (!root) {
    throw new Error(
      "로컬 첨부파일 저장 폴더가 연결되어 있지 않거나 접근 권한이 없습니다.",
    );
  }

  return root;
}

async function getDirectoryByParts(
  root: FileSystemDirectoryHandle,
  parts: string[],
  create: boolean,
): Promise<FileSystemDirectoryHandle> {
  let current = root;

  for (const part of parts) {
    current = await current.getDirectoryHandle(part, {
      create,
    });
  }

  return current;
}

function splitAttachmentPath(path: string) {
  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);

  if (parts.some((part) => part === "." || part === "..")) {
    throw new Error(`허용되지 않는 첨부파일 경로입니다: ${path}`);
  }

  if (parts[0] !== ATTACHMENTS_DIRECTORY) {
    throw new Error(`첨부파일 저장 영역 밖의 경로입니다: ${path}`);
  }

  return parts;
}

async function getFileHandleFromAttachmentPath(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemFileHandle> {
  const parts = splitAttachmentPath(path);

  if (parts.length < 2) {
    throw new Error(`올바르지 않은 로컬 첨부파일 경로입니다: ${path}`);
  }

  const fileName = parts.pop();

  if (!fileName) {
    throw new Error(`첨부파일 이름을 확인할 수 없습니다: ${path}`);
  }

  const directory = await getDirectoryByParts(root, parts, false);

  return directory.getFileHandle(fileName);
}

export async function saveLocalAttachment(file: File): Promise<AttachmentItem> {
  const root = await requireRootDirectory();

  const { year, month, day } = getDateParts();

  const directory = await getDirectoryByParts(
    root,
    [ATTACHMENTS_DIRECTORY, year, month, day],
    true,
  );

  const id = crypto.randomUUID();

  const extension = getFileExtension(file.name);

  const storedFileName = `${id}${extension}`;

  const fileHandle = await directory.getFileHandle(storedFileName, {
    create: true,
  });

  const writable = await fileHandle.createWritable();

  try {
    await writable.write(file);
    await writable.close();
  } catch (error) {
    try {
      await writable.abort();
    } catch {
      // 원래 저장 오류를 유지한다.
    }

    throw error;
  }

  const relativePath = [
    ATTACHMENTS_DIRECTORY,
    year,
    month,
    day,
    storedFileName,
  ].join("/");

  return {
    id,
    storageType: "local",
    path: relativePath,
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    bucket: null,
    publicUrl: null,
  };
}

export async function readLocalAttachment(
  attachment: AttachmentItem,
): Promise<File> {
  if ((attachment.storageType ?? "supabase") !== "local") {
    throw new Error(`로컬 첨부파일이 아닙니다: ${attachment.name}`);
  }

  const root = await requireRootDirectory();

  const fileHandle = await getFileHandleFromAttachmentPath(
    root,
    attachment.path,
  );

  return fileHandle.getFile();
}

export async function createLocalAttachmentUrl(
  attachment: AttachmentItem,
): Promise<string> {
  const file = await readLocalAttachment(attachment);

  return URL.createObjectURL(file);
}

export async function deleteLocalAttachment(
  attachment: AttachmentItem,
): Promise<void> {
  if ((attachment.storageType ?? "supabase") !== "local") {
    throw new Error(`로컬 첨부파일이 아닙니다: ${attachment.name}`);
  }

  const root = await requireRootDirectory();

  const parts = splitAttachmentPath(attachment.path);

  if (parts.length < 2) {
    throw new Error(
      `올바르지 않은 로컬 첨부파일 경로입니다: ${attachment.path}`,
    );
  }

  const fileName = parts.pop();

  if (!fileName) {
    throw new Error(`첨부파일 이름을 확인할 수 없습니다: ${attachment.path}`);
  }

  try {
    const directory = await getDirectoryByParts(root, parts, false);

    await directory.removeEntry(fileName);
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") {
      return;
    }

    throw error;
  }
}
