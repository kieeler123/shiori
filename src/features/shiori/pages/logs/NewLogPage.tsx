import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import LogEditor from "@/features/shiori/components/LogEditor";
import { dbCreate } from "@/features/shiori/repo/shioriRepo";
import { useSession } from "@/features/auth/useSession";
import { dbLogsTrashHardDelete } from "../../repo/trashRepo";
import { Button } from "@/shared/ui/primitives/Button";
import { PageSection } from "@/app/layout/PageSection";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { logError } from "@/shared/error/logError";
import { toastError } from "@/shared/error/toastError";

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

  const { t } = useI18n();

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

  async function setErrorToastAndLog(
    error: unknown,
    opts: {
      category:
        | "db"
        | "storage"
        | "attachment"
        | "editor"
        | "network"
        | "auth"
        | "render"
        | "unknown";
      action: string;
      uiMessage?: string;
      meta?: Record<string, unknown>;
    },
  ) {
    const text = opts.uiMessage ?? String((error as any)?.message ?? error);

    setToast({
      kind: "error",
      text,
    });

    await logError({
      category: opts.category,
      action: opts.action,
      page: window.location.pathname,
      error,
      meta: {
        ...opts.meta,
        uiMessage: text,
      },
    });
  }

  async function onSubmit(v: EditorSubmitValue) {
    if (isMutating) return;
    setIsMutating(true);

    try {
      const res = await dbCreate(v);

      nav("/");

      if (!res.ok) {
        // ✅ 저장은 되었는데, 뷰 정책 때문에 목록에 안 보이는 상태
        setToast({
          kind: "warn",
          text: t("logs.new.hiddenByPolicy"),
        });
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
      if ((e as Error).message === "DUPLICATE_LOG") {
        await toastError({
          error: e,
          category: "db",
          action: "create-log",
          uiMessage: t("errors.db.duplicate"),
        });
      } else {
        await toastError({
          error: e,
          category: "db",
          action: "create-log",
        });
      }
      await setErrorToastAndLog(e, {
        category: "db",
        action: "create-log",
        uiMessage: String((e as any)?.message ?? e),
        meta: {
          titleLength: v.title.length,
          contentLength: v.content.length,
          tagCount: v.tags.length,
        },
      });
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
      await setErrorToastAndLog(e, {
        category: "db",
        action: "undo-create-log",
        uiMessage: String((e as any)?.message ?? e),
        meta: {
          createdId: undo.createdId,
        },
      });
    } finally {
      setIsMutating(false);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-2)] grid place-items-center">
        <div className="text-sm text-[var(--text-5)]">
          {t("common.sessionChecking")}
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-2)] grid place-items-center">
        <div className="text-sm text-[var(--text-5)]">
          {t("logs.new.loginRequired")}
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
        <h2 className="text-xl font-semibold t2">{t("logs.new.title")}</h2>
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
            {t("logs.new.undoBanner", {
              seconds: String(secondsLeft),
              paused: undoPaused ? t("logs.new.paused") : "",
            })}
          </span>

          <Button variant="soft" onClick={applyUndo} disabled={isMutating}>
            {t("logs.new.undo")}
          </Button>
        </div>
      )}

      {/* Editor */}
      <div className="mt-4">
        <LogEditor
          submitLabel={
            isMutating ? t("common.processing") : t("logs.new.submit")
          }
          onCancel={() => nav("/logs")}
          onSubmit={onSubmit}
        />
      </div>

      {/* Hint */}
      <div className="mt-4 text-xs t5">{t("logs.new.undoHint")}</div>
    </PageSection>
  );
}
