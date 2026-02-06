import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import RouteProblem from "@/features/shiori/components/RouteProblem";
import { isUuid } from "@/features/shiori/utils/isUuid";
import {
  dbSupportGet,
  dbSupportUpdate,
} from "@/features/shiori/repo/supportRepo";
import AuthPanel from "@/features/auth/AuthPanel"; // ✅ 로그인 UI 제공(선택)

export default function SupportEditPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { ready, isAuthed, userId } = useSession();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const idOk = isUuid(id);

  const isMine = useMemo(() => {
    if (!isAuthed || !userId) return false;
    return ownerId === userId;
  }, [isAuthed, userId, ownerId]);

  useEffect(() => {
    if (!ready) return;
    if (!idOk) return;

    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const row = await dbSupportGet(id!);
        if (!alive) return;

        if (!row) {
          setOwnerId(null);
          setTitle("");
          setBody("");
          return;
        }

        setOwnerId(row.user_id);
        setTitle(row.title ?? "");
        setBody(row.body ?? "");
      } finally {
        if (alive) setLoading(false);
      }
    })().catch(console.error);

    return () => {
      alive = false;
    };
    // ✅ 핵심: 로그인 상태 변화에도 다시 fetch
  }, [ready, idOk, id, isAuthed]);

  async function save() {
    if (!idOk) return;
    if (!isMine) return;
    if (busy) return;

    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;

    setBusy(true);
    try {
      await dbSupportUpdate(id!, { title: t, body: b });
      nav(`/support/${id}`);
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

  if (!idOk) {
    return (
      <RouteProblem
        title="잘못된 주소"
        message="support id가 uuid 형식이 아니라 수정할 수 없어요."
        hint={`받은 값: ${String(id)}`}
      />
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="text-sm text-zinc-400 mb-3">
            로그인 후 수정할 수 있어요.
          </div>
          {/* ✅ 여기서도 로그인 버튼 제공하면 UX가 훨씬 안정적 */}
          <AuthPanel />
        </div>
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

  if (!isMine) {
    return (
      <RouteProblem
        title="권한 없음"
        message="본인이 작성한 문의만 수정할 수 있어요."
        hint={`support id: ${id}`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">문의 수정</h2>
          <button
            className="cursor-pointer rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav(`/support/${id}`)}
            disabled={busy}
          >
            닫기
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700/60"
          />
          <button
            onClick={save}
            disabled={busy || !title.trim() || !body.trim()}
            className="rounded-xl border border-zinc-700/70 bg-zinc-100 px-3 py-2 text-sm text-zinc-900 hover:bg-white disabled:opacity-50"
          >
            {busy ? "처리 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
