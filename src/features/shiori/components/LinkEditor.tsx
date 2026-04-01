import { useState } from "react";
import { cancelBtn, chip, fieldControl } from "@/shared/theme/editor";
import { Input } from "@/shared/ui/primitives/Input";
import { logError } from "@/shared/error/logError";
import type { LinkPreviewItem } from "../type";
import { fetchLinkPreview } from "@/lib/fetchLinkPreview";

type Props = {
  links: LinkPreviewItem[];
  setLinks: React.Dispatch<React.SetStateAction<LinkPreviewItem[]>>;
  onInsertToContent?: (linkId: string) => void;
  disabled?: boolean;
};

export default function LinkEditor({
  links,
  setLinks,
  onInsertToContent,
  disabled = false,
}: Props) {
  const [urlInput, setUrlInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFetchPreview() {
    const raw = urlInput.trim();
    if (!raw || busy || disabled) return;

    setBusy(true);
    setErr(null);

    try {
      const preview = await fetchLinkPreview(raw);

      const exists = links.some((item) => item.url === preview.url);
      if (exists) {
        setErr("이미 추가된 링크입니다.");
        return;
      }

      const item: LinkPreviewItem = {
        id: crypto.randomUUID(),
        url: preview.url,
        title: preview.title,
        description: preview.description ?? null,
        image: preview.image ?? null,
        siteName: preview.siteName ?? null,
      };

      setLinks((prev) => [...prev, item]);
      setUrlInput("");
    } catch (e) {
      console.error(e);

      await logError({
        category: "network",
        action: "add-link-preview",
        page:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        error: e,
        meta: {
          urlInput: raw,
        },
      });

      setErr("링크 미리보기를 불러올 수 없습니다.");
    } finally {
      setBusy(false);
    }
  }

  function handleRemoveLink(id: string) {
    setLinks((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://example.com"
          className={fieldControl}
          disabled={disabled || busy}
        />

        <button
          type="button"
          className={cancelBtn}
          onClick={handleFetchPreview}
          disabled={disabled || busy || !urlInput.trim()}
        >
          {busy ? "불러오는 중..." : "링크 추가"}
        </button>
      </div>

      {err ? <div className="text-sm text-[var(--danger)]">{err}</div> : null}

      {links.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm font-medium">추가된 링크</div>

          {links.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border p-4"
              style={{
                background: "var(--bg-elev-1)",
                borderColor: "var(--border-soft)",
              }}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={chip}>링크</span>
                  {item.siteName ? (
                    <span className="text-xs text-[var(--text-4)]">
                      {item.siteName}
                    </span>
                  ) : null}
                </div>

                <div className="text-sm font-medium text-[var(--text-1)] break-all">
                  {item.title}
                </div>

                <div className="text-xs text-[var(--text-4)] break-all">
                  {item.url}
                </div>

                {item.description ? (
                  <div className="text-sm text-[var(--text-3)] break-words">
                    {item.description}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-1">
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
                    onClick={() => handleRemoveLink(item.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
