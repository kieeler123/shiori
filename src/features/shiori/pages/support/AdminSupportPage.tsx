import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
import { dbSupportList } from "@/features/shiori/repo/supportRepo";
import { dbSupportSoftDelete } from "@/features/shiori/repo/supportTrashRepo";
import { actionBtn } from "@/app/ui/btn";
import type { SupportTicketListRow } from "../../type";

export default function AdminFeedbackPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  const [rows, setRows] = useState<SupportTicketListRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setErr(null);
    setBusy(true);
    try {
      const data = await dbSupportList();
      setRows(data);
    } catch (e) {
      console.error(e);
      setErr(String((e as any)?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("삭제할까요?")) return;
    setBusy(true);
    try {
      await dbSupportSoftDelete(id);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    if (!isAuthed) return;
    refresh().catch(console.error);
  }, [ready, isAuthed]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center">
        <div className="text-sm text-zinc-400">세션 확인중…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button className={actionBtn} onClick={() => nav(-1)}>
            뒤로
          </button>
          <div className="text-xs text-zinc-500">Admin / Feedback</div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">제보 목록</h1>
        <p className="mt-1 text-sm text-zinc-400">관리자만 접근 가능 (RLS)</p>

        {!isAuthed ? (
          <div className="mt-6">
            <div className="mb-3 text-sm text-zinc-400">
              로그인 후 확인할 수 있어요.
            </div>
            <AuthPanel />
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <button className={actionBtn} onClick={refresh} disabled={busy}>
                {busy ? "불러오는 중..." : "새로고침"}
              </button>
              <div className="text-xs text-zinc-500">{rows.length}건</div>
            </div>

            {err ? (
              <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-200">
                {err}
                <div className="mt-2 text-xs text-zinc-400">
                  (관리자 등록이 안 됐거나 RLS 정책에 막힌 경우가 정상입니다.)
                </div>
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs text-zinc-500">
                      {new Date(r.created_at).toLocaleString()} · {r.status}
                    </div>
                    <div className="mt-1 text-sm text-zinc-100">
                      {r.title || "(제목 없음)"}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      작성자: {r.nickname}
                    </div>

                    <button
                      className={
                        "rounded-xl border border-red-900/60 px-3 py-2 text-sm text-red-300 hover:bg-red-950/30 " +
                        (busy ? "opacity-50 cursor-not-allowed" : "")
                      }
                      disabled={busy}
                      onClick={() => remove(r.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}

              {rows.length === 0 && !err ? (
                <div className="text-sm text-zinc-500">
                  아직 제보가 없습니다.
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
