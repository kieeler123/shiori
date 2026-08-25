import type { ReactNode } from "react";
import type { AttachmentItem, LinkPreviewItem, TableData } from "../../type";

import LogTable from "./LogTable";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { logError } from "@/shared/error/logError";
import { supabase } from "@/lib/supabaseClient";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

import { useNavigate } from "react-router-dom";
import { getAttachmentViewerPath } from "@/features/attatchments/lib/getAttachmentViewerPath";

type MarkdownLinkTarget = {
  id: string;
};

type Props = {
  logId: string;
  content: string;
  tableData?: TableData | null;
  attachments?: AttachmentItem[];
  links?: LinkPreviewItem[];

  /**
   * Markdown 파일 링크를 Shiori Log로 변환할 때 사용.
   *
   * 예:
   * GENERAL.md
   * JLPT.md#문제-1
   *
   * filename을 받아 해당 Log의 id를 반환한다.
   *
   * 아직 source_filename DB 연결을 만들지 않았다면
   * 전달하지 않아도 기존 Markdown 렌더링은 정상 동작한다.
   */
  resolveMarkdownFile?: (
    filename: string,
  ) => Promise<MarkdownLinkTarget | null>;
};

const TOKEN_REGEX = /\[\[(table|attach|link):([^\]]+)\]\]/g;

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getMarkdownFileName(href: string) {
  const rawPath = href.split("#")[0].split("?")[0];

  const normalized = safeDecodeURIComponent(rawPath)
    .replace(/\\/g, "/")
    .normalize("NFC")
    .trim()
    .toLowerCase();

  return normalized.split("/").pop() ?? "";
}

function findMarkdownAttachment(href: string, attachments: AttachmentItem[]) {
  const filename = getMarkdownFileName(href);

  if (!filename) {
    return null;
  }

  const matches = attachments.filter(
    (item) => item.name.normalize("NFC").trim().toLowerCase() === filename,
  );

  return matches.length === 1 ? matches[0] : null;
}

/**
 * `.md`, `.markdown`
 * `.md#heading`
 * `.markdown#heading`
 */
function isMarkdownHref(href: string) {
  const cleanPath = href.split("#")[0].split("?")[0].toLowerCase();

  return cleanPath.endsWith(".md") || cleanPath.endsWith(".markdown");
}

function splitMarkdownHref(href: string) {
  const hashIndex = href.indexOf("#");

  if (hashIndex === -1) {
    return {
      filename: decodeURIComponent(href),
      anchor: null,
    };
  }

  return {
    filename: decodeURIComponent(href.slice(0, hashIndex)),
    anchor: decodeURIComponent(href.slice(hashIndex + 1)),
  };
}

function scrollToAnchor(anchor: string) {
  if (!anchor) return;

  const decodedAnchor = decodeURIComponent(anchor);

  requestAnimationFrame(() => {
    const target = document.getElementById(decodedAnchor);

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function MarkdownTextBlock({
  text,
  logId,
  attachments,
  navigate,
  resolveMarkdownFile,
}: {
  text: string;
  logId: string;
  attachments: AttachmentItem[];
  navigate: ReturnType<typeof useNavigate>;
  resolveMarkdownFile?: Props["resolveMarkdownFile"];
}) {
  if (!text.trim()) {
    return null;
  }

  return (
    <div className="markdown-viewer min-w-0 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          /*
           * -----------------------------
           * Headings
           * -----------------------------
           */

          h1: ({ children, ...props }) => (
            <h1
              {...props}
              className="mb-4 mt-8 scroll-mt-24 text-2xl font-bold tracking-tight text-[var(--text-1)] first:mt-0"
            >
              {children}
            </h1>
          ),

          h2: ({ children, ...props }) => (
            <h2
              {...props}
              className="mb-3 mt-8 scroll-mt-24 text-xl font-semibold tracking-tight text-[var(--text-1)]"
            >
              {children}
            </h2>
          ),

          h3: ({ children, ...props }) => (
            <h3
              {...props}
              className="mb-2 mt-6 scroll-mt-24 text-lg font-semibold text-[var(--text-1)]"
            >
              {children}
            </h3>
          ),

          h4: ({ children, ...props }) => (
            <h4
              {...props}
              className="mb-2 mt-5 scroll-mt-24 text-base font-semibold text-[var(--text-2)]"
            >
              {children}
            </h4>
          ),

          /*
           * -----------------------------
           * Paragraph / lists
           * -----------------------------
           */

          p: ({ children }) => (
            <p className="my-3 whitespace-pre-wrap leading-7 text-[var(--text-3)]">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-6 text-[var(--text-3)]">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-6 text-[var(--text-3)]">
              {children}
            </ol>
          ),

          li: ({ children }) => <li className="leading-7">{children}</li>,

          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-[var(--border-soft)] pl-4 text-[var(--text-4)]">
              {children}
            </blockquote>
          ),

          hr: () => <hr className="my-7 border-[var(--border-soft)]" />,

          /*
           * -----------------------------
           * Markdown GFM Table
           * -----------------------------
           */

          table: ({ children }) => (
            <div className="my-5 w-full overflow-x-auto rounded-xl border border-[var(--border-soft)]">
              <table className="min-w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-[var(--bg-elev-1)] text-[var(--text-2)]">
              {children}
            </thead>
          ),

          tbody: ({ children }) => (
            <tbody className="divide-y divide-[var(--border-soft)]">
              {children}
            </tbody>
          ),

          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-[var(--bg-elev-1)]">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th
              scope="col"
              className="
                whitespace-nowrap
                border-r
                border-[var(--border-soft)]
                px-3
                py-2.5
                text-left
                font-semibold
                last:border-r-0
              "
            >
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td
              className="
                border-r
                border-[var(--border-soft)]
                px-3
                py-2.5
                align-top
                leading-6
                text-[var(--text-3)]
                last:border-r-0
              "
            >
              {children}
            </td>
          ),

          /*
           * -----------------------------
           * Inline / block code
           * -----------------------------
           */

          code: ({ children, className }) => {
            const isBlock = Boolean(className);

            if (isBlock) {
              return (
                <code
                  className={`block overflow-x-auto text-sm ${className ?? ""}`}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded bg-[var(--bg-elev-1)] px-1.5 py-0.5 text-[0.9em] text-[var(--text-2)]">
                {children}
              </code>
            );
          },

          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-4">
              {children}
            </pre>
          ),

          /*
           * -----------------------------
           * Links
           * -----------------------------
           */

          a: ({ href, children }) => {
            console.log("[MarkdownRenderer] link rendered:", {
              href,
              children,
            });
            if (!href) {
              return <span>{children}</span>;
            }

            /*
             * 1. 현재 Markdown 문서 내부 anchor
             *
             * [표현 비교](#표현-비교)
             */
            if (href.startsWith("#")) {
              return (
                <a
                  href={href}
                  onClick={(event) => {
                    event.preventDefault();

                    const anchor = href.slice(1);

                    scrollToAnchor(anchor);

                    const nextUrl =
                      `${window.location.pathname}` +
                      `${window.location.search}` +
                      `#${anchor}`;

                    window.history.replaceState(null, "", nextUrl);
                  }}
                  className="
                    cursor-pointer
                    font-medium
                    text-[var(--accent)]
                    underline
                    decoration-current/40
                    underline-offset-4
                    hover:decoration-current
                  "
                >
                  {children}
                </a>
              );
            }

            /*
             * 2. 다른 Markdown 파일
             *
             * JLPT.md
             * JLPT.md#問題-1
             */
            if (isMarkdownHref(href)) {
              return (
                <button
                  type="button"
                  onClick={() => {
                    void (async () => {
                      const { filename, anchor } = splitMarkdownHref(href);

                      console.log("[Markdown] click", {
                        href,
                        filename,
                        anchor,
                      });

                      /*
                       * 1. 현재 Log 첨부파일에서 먼저 찾는다.
                       */
                      const attachment = findMarkdownAttachment(
                        href,
                        attachments,
                      );

                      if (attachment) {
                        const basePath =
                          `/logs/${logId}` +
                          `/attachments/${attachment.id}` +
                          `/markdown`;

                        const nextPath = anchor
                          ? `${basePath}#${encodeURIComponent(anchor)}`
                          : basePath;

                        console.log("[Markdown] open attachment:", nextPath);

                        navigate(nextPath);
                        return;
                      }

                      /*
                       * 2. 첨부파일에 없으면 다른 Shiori Log 검색
                       */
                      if (resolveMarkdownFile) {
                        try {
                          const target = await resolveMarkdownFile(filename);

                          if (target?.id) {
                            const nextPath = anchor
                              ? `/logs/${target.id}#${encodeURIComponent(anchor)}`
                              : `/logs/${target.id}`;

                            console.log(
                              "[Markdown] open linked log:",
                              nextPath,
                            );

                            navigate(nextPath);
                            return;
                          }
                        } catch (error) {
                          console.error(
                            "[Markdown] log resolver failed:",
                            error,
                          );
                        }
                      }

                      console.error("[Markdown] target not found:", {
                        href,
                        filename,
                        attachmentNames: attachments.map((item) => item.name),
                      });
                    })();
                  }}
                  className="cursor-pointer border-0 bg-transparent p-0 font-medium text-[var(--accent)] underline underline-offset-4"
                >
                  {children}
                </button>
              );
            }

            /*
             * 3. 일반 URL
             */
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  break-all
                  font-medium
                  text-[var(--accent)]
                  underline
                  decoration-current/40
                  underline-offset-4
                  hover:decoration-current
                "
              >
                {children}
              </a>
            );
          },

          /*
           * -----------------------------
           * Markdown image
           * -----------------------------
           */

          img: ({ src, alt }) => {
            if (!src) {
              return null;
            }

            return (
              <img
                src={src}
                alt={alt ?? ""}
                loading="lazy"
                className="my-4 h-auto max-w-full rounded-xl object-contain"
              />
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;

  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`;
  }

  const gb = mb / 1024;

  return `${gb.toFixed(1)} GB`;
}

async function handleOpenAttachment(
  item: AttachmentItem,
  logId: string,
  navigate: ReturnType<typeof useNavigate>,
  t: (key: string) => string,
) {
  const viewerPath = getAttachmentViewerPath(item, logId);

  if (viewerPath) {
    navigate(viewerPath);
    return;
  }

  const { data, error } = await supabase.storage
    .from(item.bucket)
    .createSignedUrl(item.path, 60 * 30);

  if (error || !data?.signedUrl) {
    alert(t("attachments.openFailed"));

    return;
  }

  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

function AttachmentCard({
  item,
  logId,
  navigate,
  t,
}: {
  item: AttachmentItem;
  logId: string;
  navigate: ReturnType<typeof useNavigate>;
  t: (key: string) => string;
}) {
  const isImage = item.mimeType.startsWith("image/");

  if (isImage && item.publicUrl) {
    return (
      <div className="w-full">
        <a
          href={item.publicUrl}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          <img
            src={item.publicUrl}
            alt={item.name}
            className="h-auto w-full max-w-full rounded-xl object-contain"
            loading="lazy"
          />
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-4">
      <div className="text-xs text-[var(--text-5)]">
        {t("attachments.file")} · {formatBytes(item.size)}
      </div>

      <div className="mt-2 break-all text-sm font-medium text-[var(--text-1)]">
        {item.name}
      </div>

      <div className="mt-1 break-all text-xs text-[var(--text-5)]">
        {item.path}
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => void handleOpenAttachment(item, logId, navigate, t)}
          className="
            inline-block
            text-xs
            text-[var(--btn-ghost-fg)]
            underline
            underline-offset-2
            hover:text-[var(--btn-ghost-hover-fg)]
          "
        >
          {t("attachments.openFile")}
        </button>
      </div>
    </div>
  );
}

function LinkCard({ item }: { item: LinkPreviewItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="
        block
        rounded-xl
        border
        border-[var(--border-soft)]
        bg-[var(--bg-elev-1)]
        p-3
        transition-colors
        hover:border-[var(--accent)]
      "
    >
      {item.image ? (
        <img
          src={item.image}
          alt=""
          className="
            mb-3
            max-h-48
            w-full
            rounded-lg
            object-cover
          "
        />
      ) : null}

      <div className="font-semibold text-[var(--text-1)]">{item.title}</div>

      {item.description ? (
        <p className="mt-1 text-sm text-[var(--text-4)]">{item.description}</p>
      ) : null}

      <p className="mt-2 break-all text-xs text-[var(--text-5)]">
        {item.siteName ? `${item.siteName} · ` : ""}
        {item.url}
      </p>
    </a>
  );
}

export default function LogContentRenderer({
  logId,
  content,
  tableData,
  attachments = [],
  links = [],
  resolveMarkdownFile,
}: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();

  if (!content) {
    return null;
  }

  const parts: ReactNode[] = [];

  let lastIndex = 0;

  for (const match of content.matchAll(TOKEN_REGEX)) {
    const fullMatch = match[0];

    const tokenType = match[1];

    const tokenId = match[2];

    const start = match.index ?? 0;

    const end = start + fullMatch.length;

    const textBefore = content.slice(lastIndex, start);

    if (textBefore) {
      parts.push(
        <MarkdownTextBlock
          key={`text-${lastIndex}`}
          text={textBefore}
          logId={logId}
          attachments={attachments}
          navigate={navigate}
          resolveMarkdownFile={resolveMarkdownFile}
        />,
      );
    }

    /*
     * -----------------------------
     * Native Shiori table
     * -----------------------------
     */

    if (tokenType === "table") {
      const table = tableData?.tables?.[tokenId];

      if (table) {
        parts.push(<LogTable key={`table-${tokenId}`} table={table} />);
      } else {
        void logError({
          category: "editor",

          action: "render-missing-table",

          page:
            typeof window !== "undefined"
              ? window.location.pathname
              : undefined,

          error: new Error(`table ${tokenId} not found`),

          meta: {
            tokenId,
          },
        });

        parts.push(
          <div key={`missing-table-${tokenId}`}>
            {t("errors.table.notFound")}
          </div>,
        );
      }
    }

    /*
     * -----------------------------
     * Attachment
     * -----------------------------
     */

    if (tokenType === "attach") {
      const attachment = attachments.find((item) => item.id === tokenId);

      if (attachment) {
        parts.push(
          <AttachmentCard
            key={`attach-${tokenId}`}
            item={attachment}
            logId={logId}
            navigate={navigate}
            t={t}
          />,
        );
      } else {
        void logError({
          category: "attachment",

          action: "render-missing-attachment",

          page:
            typeof window !== "undefined"
              ? window.location.pathname
              : undefined,

          error: new Error(`attachment ${tokenId} not found`),

          meta: {
            tokenId,
            attachmentsLength: attachments.length,
          },
        });

        parts.push(
          <div key={`missing-attach-${tokenId}`}>
            {t("errors.attachment.notFound")}
          </div>,
        );
      }
    }

    /*
     * -----------------------------
     * Link preview
     * -----------------------------
     */

    if (tokenType === "link") {
      const link = links.find((item) => item.id === tokenId);

      if (link) {
        parts.push(<LinkCard key={`link-${tokenId}`} item={link} />);
      } else {
        void logError({
          category: "editor",

          action: "render-missing-link",

          page:
            typeof window !== "undefined"
              ? window.location.pathname
              : undefined,

          error: new Error(`link ${tokenId} not found`),

          meta: {
            tokenId,
            linksLength: links.length,
          },
        });

        parts.push(
          <div key={`missing-link-${tokenId}`}>
            {t("errors.link.notFound")}
          </div>,
        );
      }
    }

    lastIndex = end;
  }

  const rest = content.slice(lastIndex);

  if (rest) {
    parts.push(
      <MarkdownTextBlock
        key="text-rest"
        text={rest}
        logId={logId}
        attachments={attachments}
        navigate={navigate}
        resolveMarkdownFile={resolveMarkdownFile}
      />,
    );
  }

  return <div className="min-w-0 space-y-4">{parts}</div>;
}
