import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
import {
  dbMyTickets,
  type SupportTicketListRow,
} from "@/features/shiori/repo/supportRepo";

export default function MyTicketsPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();
  const [rows, setRows] = useState<SupportTicketListRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !isAuthed) return;
    (async () => {
      setLoading(true);
      try {
        const data = await dbMyTickets();
        setRows(data);
      } finally {
        setLoading(false);
      }
    })().catch(console.error);
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
          <div className="text-sm text-zinc-400 mb-3">
            로그인 후 확인할 수 있어요.
          </div>
          <AuthPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">내 문의</h2>
          <button
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav("/support")}
          >
            고객센터
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-zinc-400">불러오는 중…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-zinc-500">작성한 문의가 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => nav(`/support/${r.id}`)}
                  className="w-full text-left rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 hover:bg-zinc-900/50"
                >
                  <div className="truncate text-sm text-zinc-100">
                    {r.title || "(제목 없음)"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {new Date(r.created_at).toLocaleString()} · {r.status}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
