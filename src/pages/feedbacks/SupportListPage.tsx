import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type FeedbackRow = {
  id: string;
  type: "bug" | "idea" | "etc";
  title: string;
  body: string;
  created_at: string;
  user_id: string | null;
  page_url: string | null;
};

function previewText(s: string, max = 80) {
  const oneLine = String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!oneLine) return "(내용 없음)";
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}

function typeLabel(t: FeedbackRow["type"]) {
  if (t === "bug") return "버그";
  if (t === "idea") return "제안";
  return "기타";
}

export default function SupportListPage() {
  const nav = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shiori_feedback")
        .select("id,type,title,body,created_at,user_id,page_url")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setRows((data ?? []) as FeedbackRow[]);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 작성페이지에서 돌아오며 refresh 요청
  useEffect(() => {
    const st = (location.state ?? {}) as any;
    if (st?.refresh) {
      refresh().catch(console.error);
      nav(".", { replace: true, state: {} });
    }
  }, [location.state, refresh, nav]);

  const empty = useMemo(() => !loading && rows.length === 0, [loading, rows]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">고객센터</h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={() => nav("/support/new")}
              className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              + 제보하기
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-zinc-400">불러오는 중…</div>
        ) : null}

        <section className="space-y-3">
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => nav(`/support/${r.id}`)}
              className="
                w-full text-left
                rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5
                hover:bg-zinc-900/60 hover:border-zinc-700/70 transition
                focus:outline-none focus:ring-2 focus:ring-zinc-700/60
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="shrink-0 rounded-full border border-zinc-800/70 px-2 py-0.5 text-[11px] text-zinc-400">
                      {typeLabel(r.type)}
                    </span>
                    <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100">
                      {r.title || "(제목 없음)"}
                    </h3>
                  </div>

                  {/* ✅ 내용 한 줄 프리뷰 */}
                  <p className="mt-2 text-sm text-zinc-400">
                    {previewText(r.body, 90)}
                  </p>
                </div>

                <div className="shrink-0 text-xs text-zinc-500">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}

          {empty ? (
            <div className="text-sm text-zinc-400">
              아직 제보가 없습니다. “제보하기”로 남겨주세요.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
