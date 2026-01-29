import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import LogEditor from "../features/shiori/components/LogEditor";
import TagChip from "../features/shiori/components/TagChip";
import SearchBar from "../features/shiori/components/SearchBar";
import { useNoteSearch } from "../features/shiori/hooks/useNoteSearch";

import type { LogItem } from "../features/shiori/types";
import { loadLogs, saveLogs } from "../features/shiori/utils/storage";

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

// useNoteSearch가 기대하는 NoteItem 형태에 맞춰 어댑팅
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

export default function LogsPage() {
  const nav = useNavigate();

  const [logs, setLogs] = useState<LogItem[]>(() => loadLogs());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [undo, setUndo] = useState<UndoAction>(null);
  const [undoRemainingMs, setUndoRemainingMs] = useState<number>(0);
  const [undoPaused, setUndoPaused] = useState<boolean>(false);

  // ✅ 검색 submit/추천 클릭 시 "첫 결과로 이동" 예약 플래그
  const [pendingNavToFirst, setPendingNavToFirst] = useState(false);

  // rAF 기반 Undo 카운트다운
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const undoIdRef = useRef<string | null>(null);

  // ✅ 공통 버튼(필터 해제 등)
  const actionBtn =
    "cursor-pointer rounded-xl px-3 py-1 text-sm transition " +
    "text-zinc-300 hover:text-zinc-100 " +
    "hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

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
    if (editingId === id) setEditingId(null);
  }

  const secondsLeft = Math.max(0, Math.ceil(undoRemainingMs / 1000));

  // ✅ 검색 훅 입력 형태 어댑팅 (LogItem -> NoteItem)
  const noteItems = useMemo<NoteItem[]>(() => {
    return filteredLogs.map((l) => ({
      id: l.id,
      title: l.title,
      body: l.content,
      tags: l.tags,
      createdAt: Date.parse(l.createdAt),
      updatedAt: Date.parse(l.createdAt),
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

  // visibleItems (NoteItem[])의 id 기준으로 필터링
  const visibleIdSet = useMemo(() => {
    const s = new Set<string>();
    for (const it of visibleItems as any[]) s.add(String(it.id));
    return s;
  }, [visibleItems]);

  const logsToRender = useMemo(() => {
    if (!isSearching) return filteredLogs;
    return filteredLogs.filter((l) => visibleIdSet.has(l.id));
  }, [filteredLogs, isSearching, visibleIdSet]);

  // ✅ 검색 submit/추천 클릭 후 첫 결과 상세로 이동
  useEffect(() => {
    if (!pendingNavToFirst) return;

    // 빈 검색 상태(최근검색어 드롭다운)에서는 이동하지 않음
    if (!query.trim()) {
      setPendingNavToFirst(false);
      return;
    }

    if (logsToRender.length > 0) {
      nav(`/logs/${logsToRender[0].id}`);
    }
    setPendingNavToFirst(false);
  }, [pendingNavToFirst, query, logsToRender, nav]);

  // ✅ 검색 중엔 에디터/태그필터 숨김 (크롬 느낌)
  const showEditor = !isSearching;

  function goDetail(id: string) {
    nav(`/logs/${id}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Shiori</h1>
              <p className="mt-1 text-sm text-zinc-400">
                quick capture · tags · search
              </p>
            </div>
            <div className="text-xs text-zinc-500">v0</div>
          </div>

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
                {selectedTag ? (
                  <span className="ml-2 text-zinc-500">
                    (태그: #{selectedTag})
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        {undo && (
          <div
            className="
              mb-4 flex items-center justify-between
              rounded-2xl border border-zinc-800/60
              bg-zinc-900/50 px-4 py-3
            "
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

            <button type="button" onClick={applyUndo} className={actionBtn}>
              되돌리기
            </button>
          </div>
        )}

        {/* ✅ 검색 중엔 에디터 숨김 */}
        {showEditor ? (
          <section className="mb-8">
            {editingLog ? (
              <LogEditor
                syncKey={editingLog.id}
                key={`edit:${editingLog.id}`}
                initialTitle={editingLog.title}
                initialContent={editingLog.content}
                initialTags={editingLog.tags}
                submitLabel="수정 저장"
                onCancel={cancelEdit}
                onSubmit={(v) => updateLog(editingLog.id, v)}
              />
            ) : (
              <LogEditor key="new" submitLabel="추가" onSubmit={addLog} />
            )}
          </section>
        ) : null}

        {/* ✅ 검색 중엔 태그필터 숨김 */}
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

        {/* ✅ 목록: 클릭하면 상세 */}
        <section className="space-y-3">
          {logsToRender.map((log) => (
            <button
              key={log.id}
              type="button"
              onClick={() => goDetail(log.id)}
              className="
                w-full cursor-pointer text-left
                rounded-2xl border border-zinc-800/60
                bg-zinc-900/50 p-5
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
                  </div>

                  <p className="mt-2 text-sm text-zinc-400">
                    {previewText(log.content, 110)}
                  </p>
                </div>

                {/* (목록에서 수정/삭제는 하지 않음 - 상세에서) */}
              </div>
            </button>
          ))}

          {logsToRender.length === 0 && (
            <div className="text-sm text-zinc-400">
              {isSearching
                ? "검색 결과가 없습니다."
                : selectedTag
                  ? "해당 태그의 로그가 없습니다."
                  : "아직 로그가 없습니다."}
            </div>
          )}
        </section>

        {/* ✅ (선택) 검색 중 '목록으로 돌아가기' 느낌 */}
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
