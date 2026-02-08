import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import LogEditor from "@/features/shiori/components/LogEditor";
import { dbCreate } from "@/features/shiori/repo/shioriRepo";
import { useSession } from "@/features/auth/useSession";
import { dbHardDelete } from "../../repo/trashRepo";

type EditorSubmitValue = { title: string; content: string; tags: string[] };

const UNDO_MS = 5000;

type UndoState = { id: string; createdId: string; kind: "add" } | null;

export default function NewLogPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  const [isMutating, setIsMutating] = useState(false);

  // ✅ Undo state
  const [undo, setUndo] = useState<UndoState>(null);
  const [undoRemainingMs, setUndoRemainingMs] = useState(0);
  const [undoPaused, setUndoPaused] = useState(false);

  // rAF timer refs (LogsPage에서 쓰던 패턴 그대로)
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const undoIdRef = useRef<string | null>(null);

  const actionBtn =
    "cursor-pointer rounded-xl px-3 py-1 text-sm transition " +
    "text-zinc-300 hover:text-zinc-100 " +
    "hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

  // Undo reset
  useEffect(() => {
    if (!undo) {
      setUndoRemainingMs(0);
      setUndoPaused(false);
      undoIdRef.current = null;
      lastRef.current = 0;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    undoIdRef.current = undo.id;
    setUndoRemainingMs(UNDO_MS);
    setUndoPaused(false);
    lastRef.current = performance.now();
  }, [undo]);

  // Undo countdown
  useEffect(() => {
    if (!undo) return;
    if (undoPaused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    if (undoRemainingMs <= 0) return;

    const currentId = undo.id;

    const tick = () => {
      if (undoIdRef.current !== currentId) return;

      const now = performance.now();
      const dt = now - (lastRef.current || now);
      lastRef.current = now;

      setUndoRemainingMs((ms) => {
        const next = ms - dt;
        if (next <= 0) {
          setUndo((cur) => (cur && cur.id === currentId ? null : cur));
          return 0;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [undo, undoPaused, undoRemainingMs]);

  const secondsLeft = Math.max(0, Math.ceil(undoRemainingMs / 1000));

  async function onSubmit(v: EditorSubmitValue) {
    if (isMutating) return;
    setIsMutating(true);

    try {
      const saved = await dbCreate(v);

      // ✅ 작성 Undo 활성화(5초)
      setUndo({
        id: crypto.randomUUID(),
        kind: "add",
        createdId: saved.id,
      });

      // 작성 후 에디터는 그대로 두고(연속 작성 가능),
      // 원하면 여기서 nav("/logs", { state: { refresh: true } })로 바로 보내도 됨.
    } catch (e) {
      console.error("create failed:", e);
      alert(String((e as any)?.message ?? e));
    } finally {
      setIsMutating(false);
    }
  }

  async function applyUndo() {
    if (!undo || isMutating) return;
    setIsMutating(true);

    try {
      await dbHardDelete(undo.createdId); // ✅
      setUndo(null);
    } catch (e) {
      console.error("undo failed:", e);
      alert(String((e as any)?.message ?? e));
    } finally {
      setIsMutating(false);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center">
        <div className="text-sm text-zinc-400">세션 확인중…</div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center">
        <div className="text-sm text-zinc-400">로그인 후 작성할 수 있어요.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">새 글 작성</h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={actionBtn}
              onClick={() => nav("/logs", { state: { refresh: true } })}
              disabled={isMutating}
            >
              목록으로
            </button>

            <button
              type="button"
              className={actionBtn}
              onClick={() => nav("/logs")}
              disabled={isMutating}
            >
              닫기
            </button>
          </div>
        </div>

        {/* Undo banner */}
        {undo && (
          <div
            className="mt-4 mb-4 flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-zinc-900/50 px-4 py-3"
            onMouseEnter={() => setUndoPaused(true)}
            onMouseLeave={() => {
              setUndoPaused(false);
              lastRef.current = performance.now();
            }}
          >
            <span className="text-sm text-zinc-300">
              작성됨 — <span className="text-zinc-400">{secondsLeft}초</span>
              {undoPaused ? " (멈춤)" : ""} — 되돌릴까요?
            </span>

            <button
              type="button"
              onClick={applyUndo}
              disabled={isMutating}
              className={
                actionBtn + (isMutating ? " opacity-50 cursor-not-allowed" : "")
              }
            >
              되돌리기
            </button>
          </div>
        )}

        {/* Editor */}
        <div className="mt-4">
          <LogEditor
            submitLabel={isMutating ? "처리 중..." : "작성"}
            onCancel={() => nav("/logs")}
            onSubmit={onSubmit}
          />
        </div>

        {/* Hint */}
        <div className="mt-4 text-xs text-zinc-500">
          작성 후 5초 동안 “되돌리기”로 방금 글을 삭제할 수 있어요.
        </div>
      </div>
    </div>
  );
}
