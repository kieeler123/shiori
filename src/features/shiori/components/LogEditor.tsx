import {
  cancelBtn,
  chip,
  editorShell,
  fieldControl,
  submitBtn,
} from "@/shared/theme/editor";
import { Input } from "@/shared/ui/primitives/Input";
import { Textarea } from "@/shared/ui/primitives/Textarea";
import { useMemo, useRef, useState } from "react";
import { normalizeTagsText } from "../domain/validators/LogValidator";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import TableEditor from "./TableEditor";
import type { LinkPreviewItem, SingleTable, TableData } from "../type";
import AttachmentEditor from "./AttachmentEditor";
import LinkEditor from "./LinkEditor";

type AttachmentItem = {
  id: string;
  path: string;
  name: string;
  mimeType: string;
  size: number;
  bucket: string;
};

type SubmitValue = {
  title: string;
  content: string;
  tags: string[];
  table_data?: TableData | null;
  attachments?: AttachmentItem[];
  links?: LinkPreviewItem[];
};

type Props = {
  syncKey?: string;
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  initialTableData?: TableData | null;
  submitLabel: string;
  onSubmit: (v: SubmitValue) => void | Promise<void>;
  onCancel?: () => void;
  onClick?: () => void;
  initialLinks?: LinkPreviewItem[];
  initialAttachments?: AttachmentItem[];
};

function createDefaultTable(): SingleTable {
  return {
    columns: [
      { id: "c1", label: "항목 1" },
      { id: "c2", label: "항목 2" },
    ],
    rows: [
      {
        id: "r1",
        cells: {
          c1: "",
          c2: "",
        },
      },
    ],
  };
}

export default function LogEditor({
  initialTitle = "",
  initialContent = "",
  initialTags = [],
  initialTableData = null,
  submitLabel,
  initialAttachments = [],
  onSubmit,
  onCancel,
  initialLinks = [],
}: Props) {
  const { t } = useI18n();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tagText, setTagText] = useState(initialTags.join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(
    initialTableData,
  );
  const [links, setLinks] = useState<LinkPreviewItem[]>(initialLinks);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const hasTable = content.includes("[[table:1]]");

  const tags = useMemo(() => normalizeTagsText(tagText), [tagText]);

  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 0 && content.trim().length > 0 && !isSubmitting
    );
  }, [title, content, isSubmitting]);

  const [attachments, setAttachments] =
    useState<AttachmentItem[]>(initialAttachments);

  function handleInsertTableAtCursor() {
    const tableId = "1";
    const token = `[[table:${tableId}]]`;
    const textarea = textareaRef.current;

    // 이미 표가 있으면 새로 추가하지 않음
    if (content.includes(token)) {
      textarea?.focus();
      return;
    }

    if (!textarea) {
      setContent((prev) =>
        prev.trim() ? `${prev}\n\n${token}\n\n` : `${token}\n\n`,
      );
    } else {
      const start = textarea.selectionStart ?? content.length;
      const end = textarea.selectionEnd ?? content.length;

      const before = content.slice(0, start);
      const after = content.slice(end);
      const insertText = `${token}\n\n`;
      const nextContent = `${before}${insertText}${after}`;

      setContent(nextContent);

      requestAnimationFrame(() => {
        const nextPos = before.length + insertText.length;
        textarea.focus();
        textarea.setSelectionRange(nextPos, nextPos);
      });
    }

    setTableData((prev) => ({
      tables: {
        ...(prev?.tables ?? {}),
        [tableId]: prev?.tables?.[tableId] ?? createDefaultTable(),
      },
    }));
  }

  function insertTokenAtCursor(token: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setContent((prev) =>
        prev.trim() ? `${prev}\n\n${token}\n\n` : `${token}\n\n`,
      );
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;

    const before = content.slice(0, start);
    const after = content.slice(end);
    const insertText = `${token}\n\n`;
    const nextContent = `${before}${insertText}${after}`;

    setContent(nextContent);

    requestAnimationFrame(() => {
      const nextPos = before.length + insertText.length;
      textarea.focus();
      textarea.setSelectionRange(nextPos, nextPos);
    });
  }

  function handleInsertAttachmentToken(attachmentId: string) {
    insertTokenAtCursor(`[[attach:${attachmentId}]]`);
  }

  function handleInsertLinkToken(linkId: string) {
    insertTokenAtCursor(`[[link:${linkId}]]`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErr(null);

    try {
      await onSubmit({
        title: title.trim(),
        content,
        tags,
        table_data: tableData,
        attachments,
        links,
      });
    } catch (e) {
      console.error(e);
      setErr(String((e as any)?.message ?? e));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={editorShell}>
      <div className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("logs.editor.phTitle")}
          className={fieldControl}
        />

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          placeholder={t("logs.editor.phContent")}
          rows={10}
          className={fieldControl}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInsertTableAtCursor}
            className={cancelBtn}
            disabled={hasTable}
          >
            {hasTable ? "표 이미 삽입됨" : "표 삽입"}
          </button>
        </div>

        <Input
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          placeholder={t("logs.editor.phTags")}
          className={fieldControl}
        />

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tt) => (
              <span key={tt} className={chip}>
                #{tt}
              </span>
            ))}
          </div>
        ) : null}

        <TableEditor tableData={tableData} setTableData={setTableData} />

        <AttachmentEditor
          attachments={attachments}
          setAttachments={setAttachments}
          onInsertToContent={handleInsertAttachmentToken}
          disabled={isSubmitting}
        />

        <LinkEditor
          links={links}
          setLinks={setLinks}
          onInsertToContent={handleInsertLinkToken}
          disabled={isSubmitting}
        />

        {err ? <div className="text-sm text-[var(--danger)]">{err}</div> : null}

        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={!canSubmit} className={submitBtn}>
            {isSubmitting ? t("common.processing") : submitLabel}
          </button>

          {onCancel ? (
            <button type="button" onClick={onCancel} className={cancelBtn}>
              {t("common.cancel")}
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
