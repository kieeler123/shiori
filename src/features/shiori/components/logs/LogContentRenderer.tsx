import type { ReactNode } from "react";
import type { AttachmentItem, LinkPreviewItem, TableData } from "../../type";
import LogTable from "./LogTable";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { logError } from "@/shared/error/logError";

type Props = {
  content: string;
  tableData?: TableData | null;
  attachments?: AttachmentItem[] | null;
  links?: LinkPreviewItem[] | null;
};

const TOKEN_REGEX = /\[\[(table|attach|link):([^\]]+)\]\]/g;

function TextBlock({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="whitespace-pre-wrap break-words text-sm t4 leading-relaxed">
      {text}
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

function AttachmentCard({ item }: { item: AttachmentItem }) {
  const isImage = item.mimeType.startsWith("image/");

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: "var(--bg-elev-1)",
        borderColor: "var(--border-soft)",
      }}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[color:var(--border-soft)] px-2 py-1 text-xs text-[var(--text-5)]">
            {isImage ? "이미지" : "첨부파일"}
          </span>
          <span className="text-xs text-[var(--text-4)]">
            {formatBytes(item.size)}
          </span>
        </div>

        <div className="break-all text-sm font-medium text-[var(--text-1)]">
          {item.name}
        </div>

        <div className="break-all text-xs text-[var(--text-4)]">
          {item.path}
        </div>

        {item.publicUrl ? (
          isImage ? (
            <div className="space-y-2">
              <img
                src={item.publicUrl}
                alt={item.name}
                className="max-h-96 rounded-xl border border-[color:var(--border-soft)] object-contain"
              />
              <a
                href={item.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs underline underline-offset-2"
              >
                원본 열기
              </a>
            </div>
          ) : (
            <a
              href={item.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm underline underline-offset-2"
            >
              파일 열기
            </a>
          )
        ) : (
          <div className="text-xs text-[var(--text-4)]">
            파일 URL을 불러올 수 없습니다.
          </div>
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
      className="block rounded-2xl border p-4"
      style={{
        background: "var(--bg-elev-1)",
        borderColor: "var(--border-soft)",
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="h-32 w-full rounded-xl border object-cover md:w-48"
            style={{ borderColor: "var(--border-soft)" }}
          />
        ) : null}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="break-words text-sm font-medium text-[var(--text-1)]">
            {item.title}
          </div>

          {item.description ? (
            <div className="break-words text-sm text-[var(--text-3)]">
              {item.description}
            </div>
          ) : null}

          <div className="break-all text-xs text-[var(--text-4)]">
            {item.siteName ? `${item.siteName} · ` : ""}
            {item.url}
          </div>
        </div>
      </div>
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
      parts.push(
        <TextBlock key={`text-${lastIndex}-${start}`} text={textBefore} />,
      );
    }

    if (tokenType === "table") {
      const table = tableData?.tables?.[tokenId];

      if (table) {
        parts.push(
          <LogTable key={`table-${tokenId}-${start}`} table={table} />,
        );
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
          <div
            key={`missing-table-${tokenId}-${start}`}
            className="my-3 rounded-md border border-dashed px-3 py-2 text-xs t6"
          >
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
            key={`attach-${tokenId}-${start}`}
            item={attachment}
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
          <div
            key={`missing-attach-${tokenId}-${start}`}
            className="my-3 rounded-md border border-dashed px-3 py-2 text-xs t6"
          >
            {t("errors.attachment.notFound")}
          </div>,
        );
      }
    }

    if (tokenType === "link") {
      const link = links?.find((item) => item.id === tokenId);

      if (link) {
        parts.push(<LinkCard key={`link-${tokenId}-${start}`} item={link} />);
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
          <div
            key={`missing-link-${tokenId}-${start}`}
            className="my-3 rounded-md border border-dashed px-3 py-2 text-xs t6"
          >
            {t("errors.link.notFound")}
          </div>,
        );
      }
    }

    lastIndex = end;
  }

  const rest = content.slice(lastIndex);
  if (rest) {
    parts.push(<TextBlock key={`text-rest-${lastIndex}`} text={rest} />);
  }

  return <div className="space-y-4">{parts}</div>;
}
