import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

import { supabase } from "@/lib/supabaseClient";
import { PageSection } from "@/app/layout/PageSection";
import { dbGet } from "@/features/shiori/repo/shioriRepo";

import type { AttachmentItem } from "@/features/shiori/type";

import "@/shared/theme/themes/markdown.css";

type ViewerState = {
  loading: boolean;
  error: string | null;
  markdown: string;
  attachment: AttachmentItem | null;
  attachments: AttachmentItem[];
};

function handlePrint() {
  window.print();
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeFilename(value: string) {
  return safeDecodeURIComponent(value)
    .replace(/\\/g, "/")
    .split("?")[0]
    .split("#")[0]
    .normalize("NFC")
    .trim()
    .toLowerCase();
}

function getFileNameFromPath(sourcePath: string) {
  const normalized = normalizeFilename(sourcePath);

  return normalized.split("/").pop() ?? "";
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
    (item) =>
      item.name.normalize("NFC").trim().toLowerCase() === sourceFileName,
  );

  // 같은 이름의 첨부파일이 정확히 하나일 때만 이동
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

function isMarkdownLink(href: string) {
  const path = href.split("#")[0].split("?")[0].toLowerCase();

  return path.endsWith(".md") || path.endsWith(".markdown");
}

function splitMarkdownLink(href: string) {
  const hashIndex = href.indexOf("#");

  if (hashIndex === -1) {
    return {
      sourcePath: safeDecodeURIComponent(href),
      anchor: null,
    };
  }

  return {
    sourcePath: safeDecodeURIComponent(href.slice(0, hashIndex)),
    anchor: safeDecodeURIComponent(href.slice(hashIndex + 1)),
  };
}

function scrollToAnchor(anchor: string) {
  if (!anchor) {
    return;
  }

  const decodedAnchor = safeDecodeURIComponent(anchor);

  requestAnimationFrame(() => {
    document.getElementById(decodedAnchor)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
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
      console.warn("[MarkdownViewer] asset attachment not found:", sourcePath);

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
  const navigate = useNavigate();

  const { logId, attachmentId } = useParams<{
    logId: string;
    attachmentId: string;
  }>();

  const [state, setState] = useState<ViewerState>({
    loading: true,
    error: null,
    markdown: "",
    attachment: null,
    attachments: [],
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
          attachments: [],
        });

        return;
      }

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const log = await dbGet(logId);

        if (!log) {
          throw new Error("로그를 찾을 수 없습니다.");
        }

        const attachments = (log.attachments ?? []) as AttachmentItem[];

        const attachment =
          attachments.find((item) => item.id === attachmentId) ?? null;

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
          attachments,
        );

        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          error: null,
          markdown: resolvedMarkdown,
          attachment,
          attachments,
        });
      } catch (error) {
        console.error("[MarkdownViewer] load failed:", error);

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
          attachments: [],
        });
      }
    }

    void loadMarkdown();

    return () => {
      cancelled = true;
    };
  }, [logId, attachmentId]);

  // 다른 .md#anchor 로 이동한 뒤 DOM 생성 후 스크롤
  useEffect(() => {
    if (state.loading || state.error || !state.markdown) {
      return;
    }

    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const anchor = safeDecodeURIComponent(hash.slice(1));

    requestAnimationFrame(() => {
      document.getElementById(anchor)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [state.loading, state.error, state.markdown, attachmentId]);

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
              rehypePlugins={[rehypeRaw, rehypeSlug]}
              components={{
                a: ({ href, children }) => {
                  if (!href) {
                    return <span>{children}</span>;
                  }

                  /*
                   * 1. 현재 Markdown 파일 내부 anchor
                   *
                   * [표현 비교](#표현-비교)
                   */
                  if (href.startsWith("#")) {
                    return (
                      <a
                        href={href}
                        onClick={(event) => {
                          event.preventDefault();

                          const anchor = safeDecodeURIComponent(href.slice(1));

                          scrollToAnchor(anchor);

                          window.history.replaceState(
                            null,
                            "",
                            `${window.location.pathname}${window.location.search}#${encodeURIComponent(anchor)}`,
                          );
                        }}
                      >
                        {children}
                      </a>
                    );
                  }

                  /*
                   * 2. 같은 Log의 다른 Markdown 첨부파일
                   *
                   * GENERAL.md
                   * JLPT.md
                   * JLPT-ANSWER.md
                   * GENERAL.md#표현-비교
                   */
                  if (isMarkdownLink(href)) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (!logId) {
                            return;
                          }

                          const { sourcePath, anchor } =
                            splitMarkdownLink(href);

                          const target = findAttachmentBySourcePath(
                            sourcePath,
                            state.attachments,
                          );

                          console.log("[MarkdownViewer] markdown link click", {
                            href,
                            sourcePath,
                            anchor,
                            target,
                          });

                          if (!target) {
                            console.error(
                              "[MarkdownViewer] target attachment not found:",
                              sourcePath,
                              state.attachments.map((item) => ({
                                id: item.id,
                                name: item.name,
                              })),
                            );

                            return;
                          }

                          const basePath =
                            `/logs/${logId}` +
                            `/attachments/${target.id}` +
                            `/markdown`;

                          const nextPath = anchor
                            ? `${basePath}#${encodeURIComponent(anchor)}`
                            : basePath;

                          console.log("[MarkdownViewer] navigate:", nextPath);

                          navigate(nextPath);
                        }}
                        className="
                          cursor-pointer
                          border-0
                          bg-transparent
                          p-0
                          font-inherit
                          text-[var(--accent)]
                          underline
                          underline-offset-4
                        "
                      >
                        {children}
                      </button>
                    );
                  }

                  /*
                   * 3. 외부 링크
                   */
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  );
                },
              }}
            >
              {state.markdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </PageSection>
  );
}
