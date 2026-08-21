import type { AttachmentItem } from "@/features/shiori/type";
import { uploadAttachment } from "./uploadAttachment";

type MarkdownAssetImportOptions = {
  bucketName?: string;
};

export type MarkdownAssetImportResult = {
  markdown: string;
  attachments: AttachmentItem[];
  importedAssets: ImportedMarkdownAsset[];
  missingAssets: MissingMarkdownAsset[];
};

export type ImportedMarkdownAsset = {
  sourcePath: string;
  attachmentId: string;
  attachment: AttachmentItem;
};

export type MissingMarkdownAsset = {
  sourcePath: string;
  reason: "file-not-found";
};

type MarkdownImageReference = {
  sourcePath: string;
};

const REMOTE_URL_PATTERN = /^(https?:)?\/\//i;
const DATA_URL_PATTERN = /^data:/i;
const ATTACHMENT_URL_PATTERN = /^attachment:/i;

/**
 * Windows / Unix 경로 구분자를 통일한다.
 */
function normalizePath(value: string) {
  return decodeURIComponent(value)
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .trim();
}

/**
 * ../ 같은 상대경로를 비교하기 쉽게 정리한다.
 *
 * 브라우저의 File 객체는 실제 로컬 절대경로를 제공하지 않기 때문에
 * 여기서는 파일 목록 내 매칭을 위한 정규화만 수행한다.
 */
function normalizeRelativePath(value: string) {
  const normalized = normalizePath(value);

  const parts = normalized.split("/");
  const result: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      if (result.length > 0) {
        result.pop();
      }

      continue;
    }

    result.push(part);
  }

  return result.join("/");
}

/**
 * 외부 URL / data URL 등은 Storage Import 대상에서 제외한다.
 */
function shouldImportAsset(sourcePath: string) {
  const value = sourcePath.trim();

  if (!value) {
    return false;
  }

  if (REMOTE_URL_PATTERN.test(value)) {
    return false;
  }

  if (DATA_URL_PATTERN.test(value)) {
    return false;
  }

  if (ATTACHMENT_URL_PATTERN.test(value)) {
    return false;
  }

  return true;
}

/**
 * Markdown 이미지:
 * ![alt](./images/photo.png)
 *
 * HTML 이미지:
 * <img src="../photo.png">
 *
 * 두 종류의 src를 모두 수집한다.
 */
function extractMarkdownImageReferences(
  markdown: string,
): MarkdownImageReference[] {
  const paths = new Set<string>();

  // Markdown image syntax
  const markdownImageRegex =
    /!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g;

  for (const match of markdown.matchAll(markdownImageRegex)) {
    const sourcePath = match[1] ?? match[2];

    if (sourcePath && shouldImportAsset(sourcePath)) {
      paths.add(sourcePath);
    }
  }

  // HTML <img src="...">
  const htmlImageRegex = /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi;

  for (const match of markdown.matchAll(htmlImageRegex)) {
    const sourcePath = match[2];

    if (sourcePath && shouldImportAsset(sourcePath)) {
      paths.add(sourcePath);
    }
  }

  return Array.from(paths).map((sourcePath) => ({
    sourcePath,
  }));
}

/**
 * File 객체에서 브라우저가 제공하는 상대경로를 가져온다.
 *
 * 폴더 선택 / webkitdirectory로 가져온 파일은
 * webkitRelativePath를 가질 수 있다.
 */
function getFileRelativePath(file: File) {
  const fileWithRelativePath = file as File & {
    webkitRelativePath?: string;
  };

  return normalizePath(fileWithRelativePath.webkitRelativePath || file.name);
}

/**
 * Markdown의 이미지 경로와 사용자가 선택한 File을 연결한다.
 *
 * 우선순위:
 * 1. 상대경로 정확 매칭
 * 2. 경로 끝부분 매칭
 * 3. 파일명 단독 매칭
 */
function findMatchingFile(sourcePath: string, files: File[]): File | null {
  const normalizedSourcePath = normalizePath(sourcePath);
  const resolvedSourcePath = normalizeRelativePath(sourcePath);

  // 1. 상대경로 정확 매칭
  const exactMatch = files.find((file) => {
    const filePath = getFileRelativePath(file);

    return filePath === normalizedSourcePath || filePath === resolvedSourcePath;
  });

  if (exactMatch) {
    return exactMatch;
  }

  // 2. 파일 상대경로가 Markdown 경로로 끝나는지 확인
  const suffixMatch = files.find((file) => {
    const filePath = getFileRelativePath(file);

    return (
      filePath.endsWith(`/${normalizedSourcePath}`) ||
      filePath.endsWith(`/${resolvedSourcePath}`)
    );
  });

  if (suffixMatch) {
    return suffixMatch;
  }

  // 3. 마지막으로 파일명 비교
  const sourceFileName =
    resolvedSourcePath.split("/").pop()?.toLowerCase() ?? "";

  if (!sourceFileName) {
    return null;
  }

  const fileNameMatches = files.filter(
    (file) => file.name.toLowerCase() === sourceFileName,
  );

  // 동일 파일명이 하나뿐일 때만 안전하게 선택
  if (fileNameMatches.length === 1) {
    return fileNameMatches[0];
  }

  return null;
}

/**
 * sourcePath를 시오리 내부 attachment 참조로 교체한다.
 *
 * 현재 형식:
 * attachment:{attachmentId}
 *
 * 나중에 Document Model을 도입하면 이 부분만 교체하면 된다.
 */
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAssetReference(
  markdown: string,
  sourcePath: string,
  attachmentId: string,
) {
  const escapedSourcePath = escapeRegExp(sourcePath);
  const replacement = `[[attach:${attachmentId}]]`;

  // 1. Markdown 이미지 전체 치환
  // ![장면1](../image.png)
  const markdownImageRegex = new RegExp(
    String.raw`!\[[^\]]*\]\(\s*(?:<${escapedSourcePath}>|${escapedSourcePath})(?:\s+["'][^"']*["'])?\s*\)`,
    "g",
  );

  let nextMarkdown = markdown.replace(markdownImageRegex, replacement);

  // 2. HTML <img> 전체 치환
  // <img src="../image.png" alt="장면1" width="49%">
  const htmlImageRegex = new RegExp(
    String.raw`<img\b[^>]*\bsrc\s*=\s*(["'])${escapedSourcePath}\1[^>]*>`,
    "gi",
  );

  nextMarkdown = nextMarkdown.replace(htmlImageRegex, replacement);

  return nextMarkdown;
}

/**
 * Markdown 안의 로컬 이미지를 Storage Attachment로 변환한다.
 */
export async function importMarkdownAssets(
  markdown: string,
  files: FileList | File[],
  options: MarkdownAssetImportOptions = {},
): Promise<MarkdownAssetImportResult> {
  const availableFiles = Array.from(files);

  const imageReferences = extractMarkdownImageReferences(markdown);

  const attachments: AttachmentItem[] = [];
  const importedAssets: ImportedMarkdownAsset[] = [];
  const missingAssets: MissingMarkdownAsset[] = [];

  let nextMarkdown = markdown;

  for (const reference of imageReferences) {
    const { sourcePath } = reference;

    const matchedFile = findMatchingFile(sourcePath, availableFiles);

    if (!matchedFile) {
      missingAssets.push({
        sourcePath,
        reason: "file-not-found",
      });

      continue;
    }

    const attachment = await uploadAttachment(matchedFile, {
      bucketName: options.bucketName,
    });

    attachments.push(attachment);

    importedAssets.push({
      sourcePath,
      attachmentId: attachment.id,
      attachment,
    });

    nextMarkdown = replaceAssetReference(
      nextMarkdown,
      sourcePath,
      attachment.id,
    );
  }

  return {
    markdown: nextMarkdown,
    attachments,
    importedAssets,
    missingAssets,
  };
}
