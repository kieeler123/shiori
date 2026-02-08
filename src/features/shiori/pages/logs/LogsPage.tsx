import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import SearchBar from "@/features/shiori/components/SearchBar";
import { useNoteSearch } from "@/features/shiori/hooks/useNoteSearch";

import { loadLogs, saveLogs } from "@/features/shiori/utils/storage";
import type { DbLogRow, LogItem } from "@/features/shiori/type/logs";

import { useSession } from "@/features/auth/useSession";
import { dbList } from "@/features/shiori/repo/shioriRepo";

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
    viewCount: (r as any).view_count ?? 0,
  };
}

function collectTags(logs: LogItem[]) {
  const map = new Map<string, number>();
  for (const log of logs) {
    for (const t of log.tags ?? []) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export default function LogsPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { ready } = useSession();

  // ✅ 로컬 캐시 → 즉시 렌더
  const [logs, setLogs] = useState<LogItem[]>(() => loadLogs());

  // UI state
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyCommented, setOnlyCommented] = useState(false);
  const [pendingNavToFirst, setPendingNavToFirst] = useState(false);

  const actionBtn =
    "cursor-pointer rounded-xl px-3 py-2 text-sm transition " +
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

  // ✅ 다른 페이지에서 돌아오며 refresh 요청
  useEffect(() => {
    const st = (location.state ?? {}) as any;
    if (st?.refresh) {
      refreshFromDb().catch(console.error);
      nav(".", { replace: true, state: {} });
    }
  }, [location.state, refreshFromDb, nav]);

  // 태그 통계(Top10)
  const tagStatsTop10 = useMemo(() => {
    return collectTags(logs).slice(0, 10);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let arr = logs;

    if (selectedTag) {
      arr = arr.filter((log) => (log.tags ?? []).includes(selectedTag));
    }

    if (onlyCommented) {
      arr = arr.filter((log) => (log.commentCount ?? 0) > 0);
    }

    return arr;
  }, [logs, selectedTag, onlyCommented]);

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

  // 검색 상태에서 “첫 결과로 이동” 요청 처리
  useEffect(() => {
    if (!pendingNavToFirst) return;
    if (!query.trim()) return setPendingNavToFirst(false);

    if (logsToRender.length > 0) nav(`/logs/${logsToRender[0].id}`);
    setPendingNavToFirst(false);
  }, [pendingNavToFirst, query, logsToRender, nav]);

  function goDetail(id: string) {
    nav(`/logs/${id}`);
  }

  if (!ready) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-zinc-950 text-zinc-100 grid place-items-center">
        <div className="text-sm text-zinc-400">세션 확인중…</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-6">
        {/* ✅ Search (상단) */}
        <div>
          <SearchBar
            query={query}
            setQuery={setQuery}
            suggestions={suggestions}
            commitSearch={commitSearch}
            pickSuggestion={pickSuggestion}
            onClear={() => {
              setSelectedTag(null);
              setOnlyCommented(false);
            }}
            onRequestNavigateFirst={() => setPendingNavToFirst(true)}
          />

          {isSearching ? (
            <div className="mt-2 text-sm text-zinc-400">
              “{query}” 검색 결과 {logsToRender.length}개
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
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

              {selectedTag ? (
                <div className="text-xs text-zinc-500">
                  태그 필터:{" "}
                  <span className="text-zinc-300">#{selectedTag}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* ✅ Tag filter (Top10) */}
        {!isSearching && tagStatsTop10.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tagStatsTop10.map(([tag, count]) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setSelectedTag((prev) => (prev === tag ? null : tag))
                  }
                  className={[
                    "text-xs px-3 py-1 rounded-full border transition",
                    active
                      ? "bg-zinc-200 text-black border-zinc-200"
                      : "bg-zinc-900/50 text-zinc-400 border-zinc-700 hover:text-zinc-200",
                  ].join(" ")}
                  title="태그 필터"
                >
                  #{tag} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* ✅ List */}
        <section className="mt-6 space-y-3">
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
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <h3 className="min-w-0 flex-1 truncate font-medium text-zinc-100">
                    {log.title || "(제목 없음)"}
                  </h3>

                  <span className="shrink-0 text-xs text-zinc-500">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>

                  <span className="shrink-0 text-xs text-zinc-500">
                    💬 {log.commentCount ?? 0}
                  </span>

                  <span className="shrink-0 text-xs text-zinc-500">
                    👀 {log.viewCount ?? 0}
                  </span>
                </div>

                <p className="mt-2 text-sm text-zinc-400">
                  {previewText(log.content, 110)}
                </p>

                {(log.tags ?? []).length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(log.tags ?? []).slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-1 rounded-full border border-zinc-700/70 text-zinc-400 bg-zinc-900/40"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </button>
          ))}

          {logsToRender.length === 0 ? (
            <div className="text-sm text-zinc-400">
              {isSearching
                ? "검색 결과가 없습니다."
                : onlyCommented
                  ? "댓글이 달린 글이 없습니다."
                  : selectedTag
                    ? "해당 태그의 글이 없습니다."
                    : "아직 로그가 없습니다."}
            </div>
          ) : null}
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
