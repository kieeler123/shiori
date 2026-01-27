import { useEffect, useMemo, useRef, useState } from "react";
import LogEditor from "../features/logs/components/LogEditor";
import TagChip from "../features/logs/components/TagChip";
import type { LogItem } from "../features/logs/types";
import { loadLogs, saveLogs } from "../features/logs/utils/storage";

type EditorSubmitValue = {
  title: string;
  content: string;
  tags: string[];
};

type UndoAction =
  | { id: string; kind: "add"; prevLogs: LogItem[] }
  | { id: string; kind: "delete"; prevLogs: LogItem[] }
  | { id: string; kind: "update"; prevLogs: LogItem[] }
  | null;

const UNDO_MS = 5000;

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>(() => loadLogs());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [undo, setUndo] = useState<UndoAction>(null);
  const [undoRemainingMs, setUndoRemainingMs] = useState<number>(0);
  const [undoPaused, setUndoPaused] = useState<boolean>(false);

  // rAF 기반 카운트다운용
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const undoIdRef = useRef<string | null>(null);

  // localStorage 저장
  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  // Undo가 바뀌면 카운트다운 리셋
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

  // 카운트다운 진행(hover 시 pause)
  useEffect(() => {
    if (!undo) return;

    // pause면 rAF 멈춤
    if (undoPaused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    // 이미 만료면 종료
    if (undoRemainingMs <= 0) return;

    const currentId = undo.id;

    const tick = () => {
      // 다른 undo로 바뀌었으면 중단
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

  const editingLog = useMemo(
    () => logs.find((l) => l.id === editingId) ?? null,
    [logs, editingId],
  );

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const log of logs) for (const t of log.tags) s.add(t);
    return [...s].sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (!selectedTag) return logs;
    return logs.filter((log) => log.tags.includes(selectedTag));
  }, [logs, selectedTag]);

  function toggleTag(tag: string) {
    setSelectedTag((cur) => (cur === tag ? null : tag));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function applyUndo() {
    if (!undo) return;
    setLogs(undo.prevLogs);
    setUndo(null);
    setEditingId(null);
  }

  function addLog(v: EditorSubmitValue) {
    setLogs((prev) => {
      setUndo({ id: crypto.randomUUID(), kind: "add", prevLogs: prev });

      const next: LogItem = {
        id: crypto.randomUUID(),
        title: v.title || "(제목 없음)",
        content: v.content,
        tags: v.tags,
        createdAt: new Date().toISOString(),
      };

      return [next, ...prev];
    });
  }

  function updateLog(id: string, v: EditorSubmitValue) {
    setLogs((prev) => {
      setUndo({ id: crypto.randomUUID(), kind: "update", prevLogs: prev });

      return prev.map((x) =>
        x.id === id
          ? {
              ...x,
              title: v.title || "(제목 없음)",
              content: v.content,
              tags: v.tags,
            }
          : x,
      );
    });

    setEditingId(null);
  }

  function removeLog(id: string) {
    setLogs((prev) => {
      setUndo({ id: crypto.randomUUID(), kind: "delete", prevLogs: prev });
      return prev.filter((x) => x.id !== id);
    });
  }

  const secondsLeft = Math.max(0, Math.ceil(undoRemainingMs / 1000));

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 text-zinc-100">
      <header className="mb-6">
        <h1 className="text-xl font-semibold">Shiori</h1>
        <p className="mt-1 text-sm text-zinc-400">
          입력 → 목록 반영 → localStorage 저장(v0)
        </p>
      </header>

      {undo && (
        <div
          className="mb-4 flex items-center justify-between rounded border border-zinc-800 bg-zinc-900 px-4 py-2"
          onMouseEnter={() => setUndoPaused(true)}
          onMouseLeave={() => {
            setUndoPaused(false);
            lastRef.current = performance.now(); // 재개 시 dt 튐 방지
          }}
        >
          <span className="text-sm text-zinc-300">
            변경됨 ({undo.kind}) —{" "}
            <span className="text-zinc-400">{secondsLeft}초</span>
            {undoPaused ? " (멈춤)" : ""} — 되돌릴까요?
          </span>

          <button
            type="button"
            onClick={applyUndo}
            className="rounded bg-zinc-200 px-3 py-1 text-sm text-zinc-900 hover:bg-white"
          >
            되돌리기
          </button>
        </div>
      )}

      <section className="mb-8">
        {editingLog ? (
          <LogEditor
            syncKey={editingLog ? editingLog.id : "new"} // ✅ 핵심
            key={`edit:${editingLog.id}`} // ✅ 핵심
            initialTitle={editingLog.title}
            initialContent={editingLog.content}
            initialTags={editingLog.tags}
            submitLabel="수정 저장"
            onCancel={cancelEdit}
            onSubmit={(v) => updateLog(editingLog.id, v)}
          />
        ) : (
          <LogEditor
            key="new" // ✅ 핵심 (추가 모드도 고정)
            submitLabel="추가"
            onSubmit={addLog}
          />
        )}
      </section>

      <section className="mb-4">
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => (
            <TagChip
              key={t}
              tag={t}
              active={selectedTag === t}
              onClick={toggleTag}
            />
          ))}

          {selectedTag && (
            <button
              type="button"
              className="ml-2 text-sm text-zinc-300 underline hover:text-white"
              onClick={() => setSelectedTag(null)}
            >
              필터 해제
            </button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="rounded border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{log.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>

              {editingId === null && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingId(log.id)}
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLog(log.id)}
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
              {log.content}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {log.tags.map((t) => (
                <TagChip
                  key={t}
                  tag={t}
                  active={selectedTag === t}
                  onClick={toggleTag}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-sm text-zinc-400">
            {selectedTag
              ? "해당 태그의 로그가 없습니다."
              : "아직 로그가 없습니다."}
          </div>
        )}
      </section>
    </div>
  );
}
