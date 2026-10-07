import { useMemo, useRef, useState } from "react";
import { chip, cancelBtn, fieldControl } from "@/shared/theme/editor";
import { uploadAttachment } from "@/features/attachments/lib/uploadAttachment";
import type { AttachmentItem } from "../type";
import { logError } from "@/shared/error/logError";
import { useNavigate } from "react-router-dom";
import { getAttachmentViewerPath } from "@/features/attachments/lib/getAttachmentViewerPath";
import { resolveAttachmentItemUrl } from "@/features/attachments/lib/attachmentResolver";

type Props = {
  attachments: AttachmentItem[];
  setAttachments: React.Dispatch<React.SetStateAction<AttachmentItem[]>>;

  onAttachmentCreated?: (attachment: AttachmentItem) => void;

  onInsertToContent?: (attachmentId: string) => void;

  logId?: string;
  disabled?: boolean;
};

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
];

const MAX_FILE_SIZE_MB = 20;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export default function AttachmentEditor({
  attachments,
  setAttachments,
  onAttachmentCreated,
  onInsertToContent,
  logId,
  disabled = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  const acceptAttr = useMemo(() => ACCEPTED_EXTENSIONS.join(","), []);

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);

    if (!files.length) {
      return;
    }

    setErr(null);
    setIsUploading(true);

    try {
      for (const file of files) {
        const attachment = await uploadAttachment(file);

        onAttachmentCreated?.(attachment);

        setAttachments((prev) => [...prev, attachment]);
      }
    } catch (e) {
      console.error("Attachment upload failed:", e);

      await logError({
        category: "attachment",
        action: "upload-handler",
        page: window.location.pathname,
        error: e,
        meta: {
          fileCount: files.length,
        },
      });

      setErr(
        "일부 파일을 첨부하지 못했습니다. 성공한 파일은 첨부 목록에 유지됩니다.",
      );
    } finally {
      setIsUploading(false);
      setDragging(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleOpenFilePicker() {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    void uploadFiles(e.target.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled || isUploading) return;
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled || isUploading) return;
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled || isUploading) return;
    const files = e.dataTransfer.files;
    if (!files?.length) {
      setDragging(false);
      return;
    }
    void uploadFiles(files);
  }

  async function handleOpenAttachment(item: AttachmentItem) {
    const viewerPath = getAttachmentViewerPath(item, logId);

    if (viewerPath) {
      navigate(viewerPath);
      return;
    }

    try {
      const url = await resolveAttachmentItemUrl(item, {
        expiresIn: 60 * 30,
      });

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Attachment open failed:", error);

      await logError({
        category: "attachment",
        action: "open-attachment",
        page: window.location.pathname,
        error,
        meta: {
          attachmentId: item.id,
          attachmentName: item.name,
        },
      });

      alert("첨부파일을 열 수 없습니다.");
    }
  }

  function handleRemoveAttachment(id: string) {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }

  function isImage(item: AttachmentItem) {
    return item.mimeType.startsWith("image/");
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptAttr}
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className={[
          fieldControl,
          "rounded-2xl border-2 border-dashed p-4 transition",
          dragging
            ? "border-[var(--field-focus-border)] bg-[var(--bg-elev-2)]"
            : "border-[var(--field-border)]",
          disabled || isUploading
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer",
        ].join(" ")}
        onClick={handleOpenFilePicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpenFilePicker();
          }
        }}
      >
        <div className="space-y-2 text-sm">
          <div className="font-medium">첨부파일</div>
          <div className="text-[var(--text-3)]">
            클릭해서 업로드하거나 파일을 여기로 드래그하세요.
          </div>
          <div className="text-xs text-[var(--text-4)]">
            허용 형식: {ACCEPTED_EXTENSIONS.join(", ")} / 최대{" "}
            {MAX_FILE_SIZE_MB}MB
          </div>
          {isUploading ? (
            <div className="text-sm text-[var(--text-2)]">업로드 중...</div>
          ) : null}
        </div>
      </div>

      {err ? <div className="text-sm text-[var(--danger)]">{err}</div> : null}

      {attachments.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm font-medium">첨부된 파일</div>

          <div className="space-y-2">
            {attachments.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border p-3"
                style={{
                  background: "var(--bg-elev-1)",
                  borderColor: "var(--border-soft)",
                }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={chip}>
                        {isImage(item) ? "이미지" : "문서"}
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

                    <button
                      type="button"
                      className="inline-block text-xs underline underline-offset-2"
                      onClick={() => handleOpenAttachment(item)}
                    >
                      미리보기 / 열기
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onInsertToContent ? (
                      <button
                        type="button"
                        className={cancelBtn}
                        onClick={() => onInsertToContent(item.id)}
                      >
                        본문에 삽입
                      </button>
                    ) : null}

                    <button
                      type="button"
                      className={cancelBtn}
                      onClick={() => handleRemoveAttachment(item.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
