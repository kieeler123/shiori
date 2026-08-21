import type { ReactNode } from "react";
import type { AttachmentItem, LinkPreviewItem, TableData } from "../../type";
import LogTable from "./LogTable";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { logError } from "@/shared/error/logError";
import { supabase } from "@/lib/supabaseClient";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { useNavigate } from "react-router-dom";
import type { NavigateFunction } from "react-router-dom";
import { getAttachmentViewerPath } from "@/features/attatchments/lib/getAttachmentViewerPath";

type Props = {
  logId: string;
  content: string;
  tableData?: TableData | null;
  attachments?: AttachmentItem[];
  links?: LinkPreviewItem[];
};

const TOKEN_REGEX = /\[\[(table|attach|link):([^\]]+)\]\]/g;

function TextBlock({ text }: { text: string }) {
  if (!text.trim()) return null;

  return (
    <div className="markdown-viewer">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {text}
      </ReactMarkdown>
    </div>
  );
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
          className="inline-block text-xs text-[var(--btn-ghost-fg)] underline underline-offset-2 hover:text-[var(--btn-ghost-hover-fg)]"
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
}: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();

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
