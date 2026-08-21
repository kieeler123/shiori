import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { supabase } from "@/lib/supabaseClient";
import { PageSection } from "@/app/layout/PageSection";
import { dbGet } from "@/features/shiori/repo/shioriRepo";
import type { AttachmentItem } from "@/features/shiori/type";

import "@/shared/theme/themes/markdown.css";
import rehypeRaw from "rehype-raw";

type ViewerState = {
  loading: boolean;
  error: string | null;
  markdown: string;
  attachment: AttachmentItem | null;
};

function handlePrint() {
  window.print();
}

function getFileNameFromPath(sourcePath: string) {
  const normalized = decodeURIComponent(sourcePath)
    .replace(/\\/g, "/")
    .split("?")[0]
    .split("#")[0];

  return normalized.split("/").pop()?.toLowerCase() ?? "";
}

function findAttachmentBySourcePath(
  sourcePath: string,
  attachments: AttachmentItem[],
) {
  const sourceFileName = getFileNameFromPath(sourcePath);

  if (!sourceFileName) {
    return null;
  }

  const matches = attachments.filter(
    (item) => item.name.toLowerCase() === sourceFileName,
  );

  // 같은 이름의 파일이 하나일 때만 안전하게 사용
  if (matches.length !== 1) {
    return null;
  }

  return matches[0];
}

function isLocalAssetPath(src: string) {
  return !(
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//") ||
    src.startsWith("data:")
  );
}

async function createAttachmentUrl(attachment: AttachmentItem) {
  const { data, error } = await supabase.storage
    .from(attachment.bucket)
    .createSignedUrl(attachment.path, 60 * 60);

  if (error) {
    throw error;
  }

  return data?.signedUrl ?? null;
}

export async function resolveMarkdownAssets(
  markdown: string,
  attachments: AttachmentItem[],
) {
  const sourcePaths = new Set<string>();

  // Markdown 이미지
  const markdownImageRegex =
    /!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g;

  for (const match of markdown.matchAll(markdownImageRegex)) {
    const src = match[1] ?? match[2];

    if (src && isLocalAssetPath(src)) {
      sourcePaths.add(src);
    }
  }

  // HTML <img>
  const htmlImageRegex = /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi;

  for (const match of markdown.matchAll(htmlImageRegex)) {
    const src = match[2];

    if (src && isLocalAssetPath(src)) {
      sourcePaths.add(src);
    }
  }

  let resolvedMarkdown = markdown;

  for (const sourcePath of sourcePaths) {
    const attachment = findAttachmentBySourcePath(sourcePath, attachments);

    if (!attachment) {
      console.warn("Markdown asset attachment not found:", sourcePath);

      continue;
    }

    const signedUrl = await createAttachmentUrl(attachment);

    if (!signedUrl) {
      continue;
    }

    resolvedMarkdown = resolvedMarkdown.split(sourcePath).join(signedUrl);
  }

  return resolvedMarkdown;
}

export default function MarkdownViewerPage() {
  const { logId, attachmentId } = useParams<{
    logId: string;
    attachmentId: string;
  }>();

  const [state, setState] = useState<ViewerState>({
    loading: true,
    error: null,
    markdown: "",
    attachment: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadMarkdown() {
      if (!logId || !attachmentId) {
        setState({
          loading: false,
          error: "로그 또는 첨부파일 ID가 없습니다.",
          markdown: "",
          attachment: null,
        });
        return;
      }

      try {
        const log = await dbGet(logId);

        if (!log) {
          throw new Error("로그를 찾을 수 없습니다.");
        }

        const attachment =
          log.attachments?.find(
            (item: AttachmentItem) => item.id === attachmentId,
          ) ?? null;

        if (!attachment) {
          throw new Error("첨부파일을 찾을 수 없습니다.");
        }

        const { data, error } = await supabase.storage
          .from(attachment.bucket)
          .createSignedUrl(attachment.path, 60 * 10);

        if (error) {
          throw error;
        }

        if (!data?.signedUrl) {
          throw new Error("첨부파일 URL을 생성하지 못했습니다.");
        }

        const response = await fetch(data.signedUrl);

        if (!response.ok) {
          throw new Error(
            `Markdown 파일을 불러오지 못했습니다. (${response.status})`,
          );
        }

        const markdown = await response.text();

        const resolvedMarkdown = await resolveMarkdownAssets(
          markdown,
          log.attachments ?? [],
        );

        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          error: null,
          markdown: resolvedMarkdown,
          attachment,
        });
      } catch (error) {
        console.error("Markdown viewer load failed:", error);

        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Markdown을 불러오는 중 오류가 발생했습니다.",
          markdown: "",
          attachment: null,
        });
      }
    }

    void loadMarkdown();

    return () => {
      cancelled = true;
    };
  }, [logId, attachmentId]);

  if (state.loading) {
    return (
      <PageSection>
        <div className="py-12 text-center text-sm text-[var(--text-4)]">
          Markdown 불러오는 중...
        </div>
      </PageSection>
    );
  }

  if (state.error) {
    return (
      <PageSection>
        <div className="py-12 text-sm text-[var(--danger)]">{state.error}</div>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <div className="mx-auto max-w-4xl py-6">
        {state.attachment ? (
          <div className="markdown-viewer-toolbar no-print mb-5 flex items-center justify-between gap-3 border-b border-[var(--border-soft)] pb-4">
            <div className="min-w-0 break-all text-sm font-medium">
              {state.attachment.name}
            </div>

            <button type="button" onClick={handlePrint}>
              PDF 저장
            </button>
          </div>
        ) : null}

        <div className="markdown-print-root">
          <article className="markdown-viewer">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {state.markdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </PageSection>
  );
}
