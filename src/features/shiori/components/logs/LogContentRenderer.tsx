import type { ReactNode } from "react";
import type { AttachmentItem, LinkPreviewItem, TableData } from "../../type";
import LogTable from "./LogTable";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { logError } from "@/shared/error/logError";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  content: string;
  tableData?: TableData | null;
  attachments?: AttachmentItem[] | null;
  links?: LinkPreviewItem[] | null;
};

const TOKEN_REGEX = /\[\[(table|attach|link):([^\]]+)\]\]/g;

function TextBlock({ text }: { text: string }) {
  if (!text) return null;
  return <p className="whitespace-pre-wrap">{text}</p>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

async function handleOpenAttachment(item: AttachmentItem) {
  const fileName = item.name.toLowerCase();

  const isText =
    item.mimeType.startsWith("text/") ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown") ||
    fileName.endsWith(".txt");

  const isPdf =
    item.mimeType === "application/pdf" || fileName.endsWith(".pdf");

  // md/txt는 기존 API로 열기
  if (isText && item.publicUrl) {
    window.open(
      `/api/attachments/view?url=${encodeURIComponent(item.publicUrl)}`,
      "_blank",
      "noopener,noreferrer",
    );
    return;
  }

  const { data, error } = await supabase.storage
    .from(item.bucket)
    .createSignedUrl(item.path, 60 * 10);

  if (error || !data?.signedUrl) {
    alert("첨부파일을 열 수 없습니다.");
    return;
  }

  // PDF는 직접 열지 않고 PDF.js 뷰어 페이지로 이동
  if (isPdf) {
    const { data, error } = await supabase.storage
      .from(item.bucket)
      .createSignedUrl(item.path, 60 * 10);

    if (error || !data?.signedUrl) {
      alert("PDF를 열 수 없습니다.");
      return;
    }

    const proxyUrl = `${window.location.origin}/api/attachments/view?type=pdf&url=${encodeURIComponent(
      data.signedUrl,
    )}`;

    window.open(
      `/pdf-viewer?url=${encodeURIComponent(proxyUrl)}`,
      "_blank",
      "noopener,noreferrer",
    );

    return;
  }

  // 이미지 등 나머지는 기존 방식 유지
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

function AttachmentCard({ item }: { item: AttachmentItem }) {
  const isImage = item.mimeType.startsWith("image/");

  return (
    <div className="rounded-2xl border p-4">
      <div className="space-y-2">
        {isImage ? "이미지" : "첨부파일"} · {formatBytes(item.size)}
      </div>

      <div className="break-all text-sm font-medium text-[var(--text-1)]">
        {item.name}
      </div>
      <div className="break-all text-xs text-[var(--text-4)]">{item.path}</div>

      <div className="mt-3">
        {item.publicUrl ? (
          isImage ? (
            <a
              href={item.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs underline underline-offset-2"
            >
              원본 열기
            </a>
          ) : (
            <button
              type="button"
              onClick={() => void handleOpenAttachment(item)}
              className="inline-block text-xs underline underline-offset-2"
            >
              파일 열기
            </button>
          )
        ) : (
          <span className="text-xs text-[var(--text-4)]">
            파일 URL을 불러올 수 없습니다.
          </span>
        )}
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
      className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-300"
    >
      {item.image ? (
        <img
          src={item.image}
          alt=""
          className="mb-3 max-h-48 w-full rounded-md object-cover"
        />
      ) : null}

      <div className="font-semibold text-slate-900">{item.title}</div>

      {item.description ? (
        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
      ) : null}

      <p className="mt-2 break-all text-xs text-slate-400">
        {item.siteName ? `${item.siteName} · ` : ""}
        {item.url}
      </p>
    </a>
  );
}

export default function LogContentRenderer({
  content,
  tableData,
  attachments,
  links,
}: Props) {
  const { t } = useI18n();

  if (!content) return null;

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
      parts.push(<TextBlock key={`text-${lastIndex}`} text={textBefore} />);
    }

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
          meta: { tokenId },
        });

        parts.push(
          <div key={`missing-table-${tokenId}`}>
            {t("errors.table.notFound")}
          </div>,
        );
      }
    }

    if (tokenType === "attach") {
      const attachment = attachments?.find((item) => item.id === tokenId);

      if (attachment) {
        parts.push(
          <AttachmentCard key={`attach-${tokenId}`} item={attachment} />,
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
            attachmentsLength: attachments?.length ?? 0,
          },
        });

        parts.push(
          <div key={`missing-attach-${tokenId}`}>
            {t("errors.attachment.notFound")}
          </div>,
        );
      }
    }

    if (tokenType === "link") {
      const link = links?.find((item) => item.id === tokenId);

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
            linksLength: links?.length ?? 0,
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
    parts.push(<TextBlock key="text-rest" text={rest} />);
  }

  return <div className="space-y-4">{parts}</div>;
}
