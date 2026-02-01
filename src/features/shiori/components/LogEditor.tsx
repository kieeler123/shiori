import { useEffect, useMemo, useState } from "react";

type SubmitValue = {
  title: string;
  content: string;
  tags: string[];
};

type Props = {
  // 기존 너 코드에서 쓰던 props 유지
  syncKey?: string; // 외부에서 초기화 트리거용으로 쓰면 좋음
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];

  submitLabel: string;
  onSubmit: (v: SubmitValue) => void | Promise<void>;
  onCancel?: () => void;
};

function normalizeTags(input: string): string[] {
  // "a, b, c" -> ["a","b","c"]
  return String(input ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function uniqLowerKeepFirst(arr: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    const key = x.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(x);
  }
  return out;
}

export default function LogEditor({
  syncKey = "new",
  initialTitle = "",
  initialContent = "",
  initialTags,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState<string>(initialTitle);
  const [content, setContent] = useState<string>(initialContent);

  // 태그는 UI에서 "comma string"으로 다루고, submit 시 배열로 변환
  const [tagText, setTagText] = useState<string>(() =>
    (initialTags ?? []).join(", "),
  );

  // ✅ 연타 방지
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 편집 대상이 바뀌면 에디터 상태 리셋 (너가 syncKey로 이미 잘 쓰고 있음)
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setTagText((initialTags ?? []).join(", "));
    setIsSubmitting(false);
  }, [syncKey, initialTitle, initialContent, initialTags]);

  const tags = useMemo(() => {
    const parsed = normalizeTags(tagText);
    return uniqLowerKeepFirst(parsed);
  }, [tagText]);

  const canSubmit = useMemo(() => {
    // 내용이 비어도 저장은 가능하게 두되, 완전 빈 글만 막고 싶으면 조건 강화 가능
    const hasSomething =
      title.trim().length > 0 || content.trim().length > 0 || tags.length > 0;
    return hasSomething && !isSubmitting;
  }, [title, content, tags, isSubmitting]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("✅ handleSubmit fired", { title, content, tags });
    if (!canSubmit) {
      console.log("⛔ canSubmit is false", {
        title,
        content,
        tags,
        isSubmitting,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content,
        tags,
      });
      console.log("✅ onSubmit resolved");
      // 추가 모드일 때만 초기화하고 싶으면(편집 모드는 유지)
      // 여기서는 외부에서 key/syncKey로 제어하니 굳이 내부 초기화 안 함
    } catch (err) {
      console.error("⛔ onSubmit error", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5"
    >
      <div className="grid gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="
            w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40
            px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600
            outline-none focus:ring-2 focus:ring-zinc-700/60
          "
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          rows={6}
          className="
            w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40
            px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600
            outline-none focus:ring-2 focus:ring-zinc-700/60
          "
        />

        <input
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          placeholder="태그 (예: js, react, 일본어)"
          className="
            w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40
            px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600
            outline-none focus:ring-2 focus:ring-zinc-700/60
          "
        />

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="select-none rounded-full border border-zinc-800/70 px-2 py-1 text-xs text-zinc-400"
              >
                #{t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-1 flex items-center gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="
              cursor-pointer rounded-xl px-4 py-2 text-sm transition
              border border-zinc-700/70 bg-zinc-900/70 text-zinc-200
              hover:bg-zinc-800 hover:text-white
              active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-zinc-700/60
              disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-zinc-900/70
            "
          >
            {isSubmitting ? "처리 중..." : submitLabel}
          </button>

          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="
                cursor-pointer rounded-xl px-4 py-2 text-sm transition
                border border-zinc-800/70 bg-transparent text-zinc-400
                hover:bg-zinc-900/60 hover:text-zinc-100
                active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-zinc-700/60
              "
            >
              취소
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
