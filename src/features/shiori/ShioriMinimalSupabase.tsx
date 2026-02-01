import { useEffect, useMemo, useState } from "react";
import { dbCreate, dbList, type DbLogRow } from "./repo/shioriRepo";

function normalizeTags(input: string) {
  return String(input ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export default function ShioriMinimalSupabase() {
  const [items, setItems] = useState<DbLogRow[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tags = useMemo(() => normalizeTags(tagsText), [tagsText]);

  async function refresh() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await dbList();
      setItems(data);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function onCreate() {
    // 최소 유효성만(운영 예외처리는 나중에)
    if (!title.trim()) {
      setErrorMsg("제목은 필수야.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const saved = await dbCreate({ title, content, tags });
      setItems((prev) => [saved, ...prev]);
      setTitle("");
      setContent("");
      setTagsText("");
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Shiori (Supabase 최소 연결)</h1>
        <p className="text-sm text-gray-500">
          list/create만으로 DB 저장/조회 확인
        </p>
      </header>

      <section className="rounded-xl border p-4 space-y-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium">제목</label>
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 오늘 배운 것"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">내용</label>
          <textarea
            className="w-full min-h-[120px] rounded-lg border px-3 py-2 outline-none focus:ring"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="짧게라도 OK"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            태그 (콤마로 구분)
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="react, supabase, vite"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border px-2 py-1 text-xs text-gray-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCreate}
            disabled={saving}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "DB에 저장"}
          </button>

          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "불러오는 중..." : "새로고침"}
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            목록 {items.length ? `(${items.length})` : ""}
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((it) => (
            <article key={it.id} className="rounded-xl border p-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-medium">{it.title}</h3>
                <time className="text-xs text-gray-500">
                  {new Date(it.created_at).toLocaleString()}
                </time>
              </div>
              {it.content && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {it.content}
                </p>
              )}
              {Array.isArray(it.tags) && it.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {it.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border px-2 py-1 text-xs text-gray-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}

          {!loading && items.length === 0 && (
            <div className="rounded-xl border p-6 text-sm text-gray-500">
              아직 DB에 데이터가 없어. 위에서 하나 저장해봐.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
