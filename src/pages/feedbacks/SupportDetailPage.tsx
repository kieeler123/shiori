import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type FeedbackRow = {
  id: string;
  type: "bug" | "idea" | "etc";
  title: string;
  body: string;
  created_at: string;
  user_id: string | null;
  page_url: string | null;
  user_agent: string | null;
};

function typeLabel(t: FeedbackRow["type"]) {
  if (t === "bug") return "버그";
  if (t === "idea") return "제안";
  return "기타";
}

export default function SupportDetailPage() {
  const nav = useNavigate();
  const { id } = useParams();

  const [item, setItem] = useState<FeedbackRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("shiori_feedback")
          .select("id,type,title,body,created_at,user_id,page_url,user_agent")
          .eq("id", id)
          .single();

        if (error) throw error;
        setItem(data as FeedbackRow);
      } catch (e) {
        console.error(e);
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-zinc-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <button
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav(-1)}
          >
            뒤로
          </button>
          <div className="mt-6 text-sm text-zinc-400">
            존재하지 않는 제보입니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav("/support")}
          >
            목록
          </button>

          <div className="text-xs text-zinc-500">
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className="shrink-0 rounded-full border border-zinc-800/70 px-2 py-0.5 text-[11px] text-zinc-400">
            {typeLabel(item.type)}
          </span>

          <h1 className="min-w-0 flex-1 text-2xl font-semibold tracking-tight">
            {item.title || "(제목 없음)"}
          </h1>
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5">
          <pre className="whitespace-pre-wrap break-words text-sm text-zinc-200">
            {item.body || "(내용 없음)"}
          </pre>
        </div>

        {item.page_url ? (
          <div className="mt-4 text-xs text-zinc-500">
            page_url: <span className="text-zinc-300">{item.page_url}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
