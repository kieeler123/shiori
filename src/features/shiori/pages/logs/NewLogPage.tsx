import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import LogEditor from "@/features/shiori/components/LogEditor";
import { dbCreate } from "@/features/shiori/repo/shioriRepo";
import { useSession } from "@/features/auth/useSession";
import { dbLogsTrashHardDelete } from "../../repo/trashRepo";
import { Button } from "@/shared/ui/primitives/Button";
import { PageSection } from "@/app/layout/PageSection";

type Toast = { kind: "ok" | "warn" | "error"; text: string } | null;

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

  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);

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
      const res = await dbCreate(v);

      if (!res.ok) {
        // ✅ 저장은 되었는데, 뷰 정책 때문에 목록에 안 보이는 상태
        setToast({
          kind: "warn",
          text: "저장은 되었지만 공개 목록 기준에 따라 숨김 처리되었습니다. (제목/내용/중복 규칙)",
        });
        // Undo를 걸지 말지: “숨김 글도 undo로 지울 수 있게” 하고 싶으면 아래 createdId로 undo 걸어도 됨.
        // setUndo({ id: crypto.randomUUID(), kind: "add", createdId: res.createdId });
        return;
      }

      // ✅ 정상 노출되는 글만 Undo 배너 활성화
      setUndo({
        id: crypto.randomUUID(),
        kind: "add",
        createdId: res.row.id,
      });

      setToast({ kind: "ok", text: "작성 완료!" });
    } catch (e) {
      console.error("create failed:", e);
      setToast({ kind: "error", text: String((e as any)?.message ?? e) });
    } finally {
      setIsMutating(false);
    }
  }

  async function applyUndo() {
    if (!undo || isMutating) return;
    setIsMutating(true);

    try {
      await dbLogsTrashHardDelete(undo.createdId); // ✅
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
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-2)] grid place-items-center">
        <div className="text-sm text-[var(--text-5)]">세션 확인중…</div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-2)] grid place-items-center">
        <div className="text-sm text-[var(--text-5)]">
          로그인 후 작성할 수 있어요.
        </div>
      </div>
    );
  }

  return (
    <PageSection>
      {toast && (
        <div className="mt-3 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)]/70 px-4 py-3 text-sm t4">
          {toast.text}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold t2">새 글 작성</h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => nav("/logs", { state: { refresh: true } })}
            disabled={isMutating}
          >
            목록으로
          </Button>

          <Button
            variant="ghost"
            onClick={() => nav("/logs")}
            disabled={isMutating}
          >
            닫기
          </Button>
        </div>
      </div>

      {/* Undo banner */}
      {undo && (
        <div
          className="mt-4 mb-4 flex items-center justify-between rounded-2xl
                 border border-[var(--border-soft)]
                 bg-[var(--bg-elev-1)]/70 px-4 py-3"
          onMouseEnter={() => setUndoPaused(true)}
          onMouseLeave={() => {
            setUndoPaused(false);
            lastRef.current = performance.now();
          }}
        >
          <span className="text-sm t4">
            작성됨 —<span className="t3 ml-1">{secondsLeft}초</span>
            {undoPaused ? " (멈춤)" : ""} — 되돌릴까요?
          </span>

          <Button variant="soft" onClick={applyUndo} disabled={isMutating}>
            되돌리기
          </Button>
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
      <div className="mt-4 text-xs t5">
        작성 후 5초 동안 “되돌리기”로 방금 글을 삭제할 수 있어요.
      </div>
    </PageSection>
  );
}
