import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import { dbGet, dbUpdate } from "@/features/shiori/repo/shioriRepo";
import LogEditor from "@/features/shiori/components/LogEditor";
import type { DbLogRow } from "../../type";

type EditorSubmitValue = { title: string; content: string; tags: string[] };

export default function EditLogPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>(); // ✅ 핵심(타입 에러 해결)
  const { isAuthed, userId } = useSession();

  const [item, setItem] = useState<DbLogRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isMine = useMemo(() => {
    if (!isAuthed || !userId) return false;
    return item?.user_id === userId;
  }, [isAuthed, userId, item?.user_id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const row = await dbGet(id);
        setItem(row);
      } finally {
        setLoading(false);
      }
    })().catch(console.error);
  }, [id]);

  async function onSubmit(v: EditorSubmitValue) {
    if (!id) return;
    if (!isAuthed || !isMine) return;

    setBusy(true);
    try {
      const updated = await dbUpdate(id, v);
      setItem(updated);
      // ✅ 수정 완료 후 상세로 이동 + refresh 요청
      nav(`/logs/${id}`, { state: { refresh: true } });
    } catch (e) {
      console.error(e);
      alert(String((e as any)?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

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
            존재하지 않는 글입니다.
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthed || !isMine) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <button
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav(`/logs/${item.id}`)}
          >
            상세로
          </button>
          <div className="mt-6 text-sm text-zinc-400">
            이 글은 작성자만 수정할 수 있어요.
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
            onClick={() => nav(`/logs/${item.id}`)}
            disabled={busy}
          >
            취소
          </button>
          <div className="text-xs text-zinc-500">
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">수정</h1>

        <div className="mt-6">
          <LogEditor
            syncKey={item.id}
            initialTitle={item.title}
            initialContent={item.content}
            initialTags={Array.isArray(item.tags) ? item.tags : []}
            submitLabel={busy ? "처리 중..." : "수정 저장"}
            onCancel={() => nav(`/logs/${item.id}`)}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
