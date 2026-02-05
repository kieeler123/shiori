import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
import {
  dbSupportList,
  type SupportTicketListRow,
} from "@/features/shiori/repo/supportRepo";

export default function SupportListPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { ready, isAuthed } = useSession();

  const [rows, setRows] = useState<SupportTicketListRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load({ toTop = false } = {}) {
    setLoading(true);
    try {
      const data = await dbSupportList();
      setRows(data);

      if (toTop) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;

    const needsTop = Boolean((location.state as any)?.refresh);

    (async () => {
      await load({ toTop: needsTop });

      // ✅ load + scroll 처리 끝난 다음에 replace
      if (needsTop) {
        nav("/support", { replace: true, state: null });
      }
    })().catch(console.error);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, location.key]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">고객센터</h2>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
              onClick={() => nav("/support/mine")}
            >
              내 문의
            </button>
            <button
              className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
              onClick={() => nav("/support/trash")}
            >
              휴지통
            </button>
            <button
              className="rounded-xl border border-zinc-700/70 bg-zinc-100 px-3 py-2 text-sm text-zinc-900 hover:bg-white"
              onClick={() => nav("/support/new")}
            >
              문의하기
            </button>
          </div>
        </div>

        {!isAuthed ? (
          <div className="mt-4">
            <div className="text-sm text-zinc-400 mb-2">
              문의 작성/내 문의 보기 기능은 로그인 후 사용 가능해요.
            </div>
            <AuthPanel />
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {loading ? "불러오는 중…" : `${rows.length}건`}
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-sm text-zinc-400">불러오는 중…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-zinc-500">아직 문의가 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => nav(`/support/${r.id}`)}
                  className="w-full text-left rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 hover:bg-zinc-900/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-zinc-100">
                        {r.title || "(제목 없음)"}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {r.nickname} · {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 border border-zinc-800/70 rounded-full px-2 py-1">
                      {r.status}
                    </span>
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
