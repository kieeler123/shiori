import {
  cancelBtn,
  chip,
  editorShell,
  fieldControl,
  submitBtn,
} from "@/shared/theme/editor";
import { Input } from "@/shared/ui/primitives/Input";
import { Textarea } from "@/shared/ui/primitives/Textarea";
import { useEffect, useMemo, useState } from "react";
import { normalizeTagsText } from "../domain/validators/LogValidator";
import { useI18n } from "@/shared/i18n/LocaleProvider";

type SubmitValue = { title: string; content: string; tags: string[] };

type Props = {
  syncKey?: string;
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  submitLabel: string;
  onSubmit: (v: SubmitValue) => void | Promise<void>;
  onCancel?: () => void;
};

export default function LogEditor({
  syncKey = "new",
  initialTitle = "",
  initialContent = "",
  initialTags,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useI18n();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tagText, setTagText] = useState((initialTags ?? []).join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setTagText((initialTags ?? []).join(", "));
    setIsSubmitting(false);
    setErr(null);
  }, [syncKey, initialTitle, initialContent, initialTags]);

  const tags = useMemo(() => normalizeTagsText(tagText), [tagText]);

  // ✅ 정책: 제목+내용 필수
  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 0 && content.trim().length > 0 && !isSubmitting
    );
  }, [title, content, isSubmitting]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErr(null);
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), tags });
    } catch (e: any) {
      setErr(e?.message ?? t("logs.editor.saveError"));
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("logs.editor.phContent")}
          rows={6}
          className={fieldControl}
        />

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

        {err ? <div className="text-sm text-[var(--danger)]">{err}</div> : null}

        <div className="pt-1 flex items-center gap-2">
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
