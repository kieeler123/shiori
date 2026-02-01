import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import LogEditor from "@/features/shiori/components/LogEditor";
import TagChip from "@/features/shiori/components/TagChip";
import SearchBar from "@/features/shiori/components/SearchBar";
import { useNoteSearch } from "@/features/shiori/hooks/useNoteSearch";

import { loadLogs, saveLogs } from "@/features/shiori/utils/storage";
import type { LogItem } from "@/features/shiori/types";

import AuthButton from "@/features/auth/AuthButton";
import { useSession } from "@/features/auth/useSession";

import {
  dbCreate,
  dbDelete,
  dbList,
  dbRestore,
  dbUpdate,
  type DbLogRow,
} from "@/features/shiori/repo/shioriRepo";

type EditorSubmitValue = { title: string; content: string; tags: string[] };

type UndoAction =
  | { id: string; kind: "add"; createdId: string; prevLogs: LogItem[] }
  | { id: string; kind: "delete"; deletedRow: DbLogRow; prevLogs: LogItem[] }
  | { id: string; kind: "update"; beforeRow: DbLogRow; prevLogs: LogItem[] }
  | null;

const UNDO_MS = 5000;

type NoteItem = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt?: number;
  updatedAt?: number;
};

function previewText(s: string, max = 110) {
  const oneLine = String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}

function toLogItem(r: DbLogRow): LogItem {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    content: r.content,
    tags: Array.isArray(r.tags) ? r.tags : [],
    createdAt: r.created_at,
    updatedAt: (r as any).updated_at ?? null,
    commentCount: (r as any).comment_count ?? 0,
  };
}

export default function LogsPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { ready, user, isAuthed } = useSession();

  // ✅ 로컬 캐시로 즉시 렌더 → DB로 정본화
  const [logs, setLogs] = useState<LogItem[]>(() => loadLogs());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [undo, setUndo] = useState<UndoAction>(null);
  const [undoRemainingMs, setUndoRemainingMs] = useState<number>(0);
  const [undoPaused, setUndoPaused] = useState<boolean>(false);

  const [pendingNavToFirst, setPendingNavToFirst] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const [onlyCommented, setOnlyCommented] = useState(false);

  // rAF Undo
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const undoIdRef = useRef<string | null>(null);

  const actionBtn =
    "cursor-pointer rounded-xl px-3 py-1 text-sm transition " +
    "text-zinc-300 hover:text-zinc-100 " +
    "hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

  const refreshFromDb = useCallback(async () => {
    const rows = await dbList();
    const next = rows.map(toLogItem);
    setLogs(next);
    saveLogs(next);
  }, []);

  // ✅ 마운트 시 DB 동기화
  useEffect(() => {
    refreshFromDb().catch(console.error);
  }, [refreshFromDb]);

  // ✅ 상세에서 돌아오며 refresh 요청
  useEffect(() => {
    const st = (location.state ?? {}) as any;
    if (st?.refresh) {
      refreshFromDb().catch(console.error);
      nav(".", { replace: true, state: {} });
    }
  }, [location.state, refreshFromDb, nav]);

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
    let arr = logs;
    if (selectedTag) arr = arr.filter((log) => log.tags.includes(selectedTag));
    if (onlyCommented) arr = arr.filter((log) => (log.commentCount ?? 0) > 0);
    return arr;
  }, [logs, selectedTag, onlyCommented]);

  function toggleTag(tag: string) {
    setSelectedTag((cur) => (cur === tag ? null : tag));
  }
  function cancelEdit() {
    setEditingId(null);
  }

  async function applyUndo() {
    if (!undo || isMutating) return;
    setIsMutating(true);

    try {
      if (undo.kind === "add") {
        await dbDelete(undo.createdId);
      } else if (undo.kind === "delete") {
        await dbRestore(undo.deletedRow);
      } else if (undo.kind === "update") {
        await dbUpdate(undo.beforeRow.id, {
          title: undo.beforeRow.title,
          content: undo.beforeRow.content,
          tags: undo.beforeRow.tags ?? [],
        });
      }

      setLogs(undo.prevLogs);
      saveLogs(undo.prevLogs);
      setUndo(null);
      setEditingId(null);
    } catch (e) {
      console.error("Undo failed:", e);
      alert(String((e as any)?.message ?? e));
    } finally {
      setIsMutating(false);
    }
  }

  async function addLog(v: EditorSubmitValue) {
    if (!isAuthed || !user) return alert("로그인 후 작성할 수 있어요.");
    if (isMutating) return;

    setIsMutating(true);
    const prevSnapshot = logs;

    try {
      const saved = await dbCreate(v);
      const nextItem = toLogItem(saved);
      const nextLogs = [nextItem, ...prevSnapshot];

      setUndo({
        id: crypto.randomUUID(),
        kind: "add",
        createdId: saved.id,
        prevLogs: prevSnapshot,
      });

      setLogs(nextLogs);
      saveLogs(nextLogs);
    } catch (e) {
      console.error("addLog failed:", e);
      alert(String((e as any)?.message ?? e));
    } finally {
      setIsMutating(false);
    }
  }

  async function updateLog(id: string, v: EditorSubmitValue) {
    if (!isAuthed || !user) return alert("로그인 후 수정할 수 있어요.");
    if (isMutating) return;

    setIsMutating(true);
    const prevSnapshot = logs;

    const before = prevSnapshot.find((x) => x.id === id);
    if (!before) return setIsMutating(false);

    const beforeRow: DbLogRow = {
      id: before.id,
      user_id: before.userId,
      title: before.title,
      content: before.content,
      tags: before.tags,
      created_at: before.createdAt,
    } as any;

    try {
      const saved = await dbUpdate(id, v);
      const nextLogs = prevSnapshot.map((x) =>
        x.id === id ? toLogItem(saved) : x,
      );

      setUndo({
        id: crypto.randomUUID(),
        kind: "update",
        beforeRow,
        prevLogs: prevSnapshot,
      });

      setLogs(nextLogs);
      saveLogs(nextLogs);
      setEditingId(null);
    } catch (e) {
      console.error("updateLog failed:", e);
      alert(String((e as any)?.message ?? e));
    } finally {
      setIsMutating(false);
    }
  }

  async function removeLog(id: string) {
    if (!isAuthed || !user) return alert("로그인 후 삭제할 수 있어요.");
    if (isMutating) return;

    setIsMutating(true);
    const prevSnapshot = logs;

    const target = prevSnapshot.find((x) => x.id === id);
    if (!target) return setIsMutating(false);

    const deletedRow: DbLogRow = {
      id: target.id,
      user_id: target.userId,
      title: target.title,
      content: target.content,
      tags: target.tags,
      created_at: target.createdAt,
    } as any;

    try {
      await dbDelete(id);

      const nextLogs = prevSnapshot.filter((x) => x.id !== id);

      setUndo({
        id: crypto.randomUUID(),
        kind: "delete",
        deletedRow,
        prevLogs: prevSnapshot,
      });

      setLogs(nextLogs);
      saveLogs(nextLogs);

      if (editingId === id) setEditingId(null);
    } catch (e) {
      console.error("removeLog failed:", e);
      alert(String((e as any)?.message ?? e));
    } finally {
      setIsMutating(false);
    }
  }

  const secondsLeft = Math.max(0, Math.ceil(undoRemainingMs / 1000));

  // 검색 어댑팅
  const noteItems = useMemo<NoteItem[]>(() => {
    return filteredLogs.map((l) => ({
      id: l.id,
      title: l.title,
      body: l.content,
      tags: l.tags,
      createdAt: Date.parse(l.createdAt),
      updatedAt: l.updatedAt
        ? Date.parse(String(l.updatedAt))
        : Date.parse(l.createdAt),
    }));
  }, [filteredLogs]);

  const {
    query,
    setQuery,
    suggestions,
    commitSearch,
    pickSuggestion,
    visibleItems,
  } = useNoteSearch(noteItems as any);

  const isSearching = query.trim().length > 0;

  const visibleIdSet = useMemo(() => {
    const s = new Set<string>();
    for (const it of visibleItems as any[]) s.add(String(it.id));
    return s;
  }, [visibleItems]);

  const logsToRender = useMemo(() => {
    if (!isSearching) return filteredLogs;
    return filteredLogs.filter((l) => visibleIdSet.has(l.id));
  }, [filteredLogs, isSearching, visibleIdSet]);

  useEffect(() => {
    if (!pendingNavToFirst) return;
    if (!query.trim()) return setPendingNavToFirst(false);

    if (logsToRender.length > 0) nav(`/logs/${logsToRender[0].id}`);
    setPendingNavToFirst(false);
  }, [pendingNavToFirst, query, logsToRender, nav]);

  const showEditor = !isSearching && isAuthed;

  function goDetail(id: string) {
    nav(`/logs/${id}`);
  }

  // ✅ 여기서만 “세션 확인중…”을 띄움
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
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Shiori</h1>
            <p className="mt-1 text-sm text-zinc-400">
              quick capture · tags · search
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-zinc-500">v0</div>
            <AuthButton />
          </div>
        </div>

        {/* Search */}
        <div className="mt-5">
          <SearchBar
            query={query}
            setQuery={setQuery}
            suggestions={suggestions}
            commitSearch={commitSearch}
            pickSuggestion={pickSuggestion}
            onClear={() => setSelectedTag(null)}
            onRequestNavigateFirst={() => setPendingNavToFirst(true)}
          />

          {isSearching ? (
            <div className="mt-2 text-sm text-zinc-400">
              “{query}” 검색 결과 {logsToRender.length}개
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className={actionBtn}
                onClick={() => setOnlyCommented((v) => !v)}
              >
                {onlyCommented ? "전체 글 보기" : "댓글 있는 글만"}
              </button>

              <button
                type="button"
                className={actionBtn}
                onClick={refreshFromDb}
              >
                새로고침
              </button>
            </div>
          )}
        </div>

        {/* Undo */}
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
              변경됨 ({undo.kind}) —{" "}
              <span className="text-zinc-400">{secondsLeft}초</span>
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

        {/* Editor (로그인 유저만) */}
        {showEditor ? (
          <section className="mb-8">
            {editingLog ? (
              <LogEditor
                syncKey={editingLog.id}
                key={`edit:${editingLog.id}`}
                initialTitle={editingLog.title}
                initialContent={editingLog.content}
                initialTags={editingLog.tags}
                submitLabel={isMutating ? "처리 중..." : "수정 저장"}
                onCancel={cancelEdit}
                onSubmit={(v) => updateLog(editingLog.id, v)}
              />
            ) : (
              <LogEditor
                key="new"
                submitLabel={isMutating ? "처리 중..." : "추가"}
                onSubmit={addLog}
              />
            )}
          </section>
        ) : (
          <section className="mb-6 text-sm text-zinc-400">
            {isAuthed
              ? null
              : "읽기 전용 모드입니다. 로그인하면 작성/수정/삭제가 가능합니다."}
          </section>
        )}

        {/* Tags */}
        {!isSearching ? (
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
                  className={actionBtn}
                  onClick={() => setSelectedTag(null)}
                >
                  필터 해제
                </button>
              )}
            </div>
          </section>
        ) : null}

        {/* List */}
        <section className="space-y-3">
          {logsToRender.map((log) => (
            <button
              key={log.id}
              type="button"
              onClick={() => goDetail(log.id)}
              className="
                w-full cursor-pointer text-left
                rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5
                hover:bg-zinc-900/70 hover:border-zinc-700/70 transition
                active:scale-[0.99]
                focus:outline-none focus:ring-2 focus:ring-zinc-700/60
              "
              title="상세 보기"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="truncate font-medium text-zinc-100">
                      {log.title}
                    </h3>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      💬 {log.commentCount ?? 0}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-zinc-400">
                    {previewText(log.content, 110)}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {logsToRender.length === 0 && (
            <div className="text-sm text-zinc-400">
              {isSearching
                ? "검색 결과가 없습니다."
                : selectedTag
                  ? "해당 태그의 로그가 없습니다."
                  : onlyCommented
                    ? "댓글이 달린 글이 없습니다."
                    : "아직 로그가 없습니다."}
            </div>
          )}
        </section>

        {/* Search clear */}
        {isSearching ? (
          <div className="mt-6">
            <button
              type="button"
              className={actionBtn}
              onClick={() => setQuery("")}
            >
              검색 지우기
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
