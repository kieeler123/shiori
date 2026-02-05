import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
import {
  dbSupportMyTrashList,
  type SupportTrashListRow,
} from "../../repo/trashRepo";
import { supabase } from "@/lib/supabaseClient";

const actionBtn =
  "cursor-pointer rounded-xl px-3 py-2 text-sm transition " +
  "text-zinc-300 hover:text-zinc-100 " +
  "border border-zinc-800/70 hover:bg-zinc-900/60 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

export default function SupportTrashPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  const [rows, setRows] = useState<SupportTrashListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const data = await dbSupportMyTrashList();
      setRows(data);
    } catch (e) {
      console.error(e);
      setErr(String((e as any)?.message ?? e));
      console.error("support trash load failed:", e);
      setErr(JSON.stringify(e, null, 2));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    if (!isAuthed) return;
    load();
  }, [ready, isAuthed]);

  useEffect(() => {
    if (!ready || !isAuthed) return;

    (async () => {
      const { data } = await supabase.auth.getUser();
      console.log("my uid (trash page):", data.user?.id);
    })();

    load();
  }, [ready, isAuthed]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center">
        <div className="text-sm text-zinc-400">세션 확인중…</div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <h2 className="text-xl font-semibold">고객센터 휴지통</h2>
          <div className="mt-3 text-sm text-zinc-400">
            로그인 후 확인할 수 있어요.
          </div>
          <div className="mt-4">
            <AuthPanel />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">고객센터 휴지통</h2>
          <button className={actionBtn} onClick={() => nav("/support")}>
            목록
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {loading ? "불러오는 중…" : `${rows.length}건`}
          </div>
          <button className={actionBtn} onClick={load} disabled={loading}>
            새로고침
          </button>
        </div>

        {err ? (
          <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <div className="mt-4">
          {loading ? (
            <div className="text-sm text-zinc-400">불러오는 중…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-zinc-500">휴지통이 비어있어요.</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4"
                >
                  <div className="truncate text-sm text-zinc-100">
                    {r.title || "(제목 없음)"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    삭제일:{" "}
                    {r.deleted_at
                      ? new Date(r.deleted_at).toLocaleString()
                      : "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
