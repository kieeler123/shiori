import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { dbSupportGet } from "@/features/shiori/repo/supportRepo";
import RouteProblem from "@/features/shiori/components/RouteProblem";
import { isUuid } from "@/features/shiori/utils/isUuid";
import { dbSupportSoftDelete } from "../../repo/supportTrashRepo";
import type { SupportTicketDetailRow } from "../../type";

export default function SupportDetailPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { ready, isAuthed, userId } = useSession();

  if (!isUuid(id)) {
    return (
      <RouteProblem
        title="잘못된 주소"
        message="support id가 uuid 형식이 아니라 조회할 수 없어요."
        hint={`받은 값: ${String(id)}\n해결: /support/new 를 :id 보다 먼저 라우팅하세요.`}
      />
    );
  }

  const [item, setItem] = useState<SupportTicketDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isMine = useMemo(() => {
    if (!isAuthed || !userId) return false;
    return item?.user_id === userId;
  }, [isAuthed, userId, item?.user_id]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      setLoading(true);
      try {
        const row = await dbSupportGet(id);
        setItem(row);
      } finally {
        setLoading(false);
      }
    })().catch(console.error);
  }, [ready, id]);

  async function remove() {
    if (!isMine) return;
    if (!confirm("휴지통으로 이동할까요?")) return;

    setBusy(true);
    try {
      await dbSupportSoftDelete(id!);
      nav("/support", { state: { refresh: true } });
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center">
        <div className="text-sm text-zinc-400">세션 확인중…</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-zinc-400">
          Loading…
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <button
            className="cursor-pointer rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav(-1)}
          >
            뒤로
          </button>
          <div className="mt-6 text-sm text-zinc-400">
            존재하지 않는 문의입니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between gap-3">
          <button
            className="cursor-pointer rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav("/support")}
          >
            목록
          </button>

          <div className="text-xs text-zinc-500">
            {item.nickname} · {new Date(item.created_at).toLocaleString()}
          </div>
        </div>

        <div className="mt-6 flex items-start justify-between gap-4">
          <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">
            {item.title || "(제목 없음)"}
          </h1>

          {isMine ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                className="cursor-pointer rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
                onClick={() => nav(`/support/${item.id}/edit`)}
              >
                수정
              </button>
              <button
                className="cursor-pointer rounded-xl border border-red-900/60 px-3 py-2 text-sm text-red-300 hover:bg-red-950/30 disabled:opacity-50"
                onClick={remove}
                disabled={busy}
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5">
          <pre className="whitespace-pre-wrap break-words text-sm text-zinc-200">
            {item.body}
          </pre>
        </div>

        <div className="mt-4 text-xs text-zinc-500">상태: {item.status}</div>
      </div>
    </div>
  );
}
