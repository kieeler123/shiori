import { useRef, useState } from "react";
import type { AttachmentItem } from "../type";
import { importMarkdownAssets } from "@/features/attatchments/lib/markdownAssetImporter";

type MarkdownImportResult = {
  markdown: string;
  filename: string;
};

type Props = {
  setAttachments: React.Dispatch<React.SetStateAction<AttachmentItem[]>>;
  onImportMarkdown: (result: MarkdownImportResult) => void;
  bucketName?: string;
  disabled?: boolean;
};

const IMPORT_ACCEPT = [
  ".md",
  ".markdown",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
].join(",");

function isMarkdownFile(file: File) {
  const name = file.name.toLowerCase();

  return (
    name.endsWith(".md") ||
    name.endsWith(".markdown") ||
    file.type === "text/markdown"
  );
}

export default function MarkdownImportButton({
  setAttachments,
  onImportMarkdown,
  bucketName = "log-attachments",
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleOpenPicker() {
    if (disabled || isImporting) {
      return;
    }

    inputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (!selectedFiles.length) {
      return;
    }

    setMessage(null);
    setIsImporting(true);

    try {
      const markdownFiles = selectedFiles.filter(isMarkdownFile);

      if (markdownFiles.length === 0) {
        throw new Error("Markdown 파일을 찾을 수 없습니다.");
      }

      if (markdownFiles.length > 1) {
        throw new Error("Markdown 파일은 한 번에 하나만 선택해 주세요.");
      }

      const markdownFile = markdownFiles[0];

      const assetFiles = selectedFiles.filter((file) => file !== markdownFile);

      const markdown = await markdownFile.text();

      const result = await importMarkdownAssets(markdown, assetFiles, {
        bucketName,
      });

      setAttachments((prev) => [...prev, ...result.attachments]);

      onImportMarkdown({
        markdown: result.markdown,
        filename: markdownFile.name,
      });

      const importedCount = result.importedAssets.length;
      const missingCount = result.missingAssets.length;

      if (missingCount > 0) {
        const missingNames = result.missingAssets
          .map((item) => item.sourcePath)
          .join(", ");

        setMessage(
          `Markdown 가져오기 완료 · 이미지 ${importedCount}개 업로드 · ` +
            `찾지 못한 이미지 ${missingCount}개: ${missingNames}`,
        );
      } else {
        setMessage(`Markdown 가져오기 완료 · 이미지 ${importedCount}개 업로드`);
      }
    } catch (error) {
      console.error("Markdown import failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Markdown 가져오기 중 오류가 발생했습니다.",
      );
    } finally {
      setIsImporting(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={IMPORT_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={handleOpenPicker}
        disabled={disabled || isImporting}
        className="rounded-xl border px-4 py-2 text-sm disabled:opacity-60"
      >
        {isImporting ? "Markdown 가져오는 중..." : "Markdown 가져오기"}
      </button>

      <div className="text-xs text-[var(--text-4)]">
        Markdown 파일과 문서에서 사용하는 이미지를 함께 선택하세요.
      </div>

      {message ? (
        <div className="text-sm text-[var(--text-3)]">{message}</div>
      ) : null}
    </div>
  );
}
