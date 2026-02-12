import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import SearchBar from "@/features/shiori/components/SearchBar";
import { useNoteSearch } from "@/features/shiori/hooks/useNoteSearch";

import { loadLogs, saveLogs } from "@/features/shiori/utils/storage";
import type { DbLogRow, LogItem, NoteItem } from "@/features/shiori/type/logs";

import { useSession } from "@/features/auth/useSession";
import { dbList } from "@/features/shiori/repo/shioriRepo";

import TagChip from "@/shared/ui/primitives/TagChip";
import { Button } from "@/shared/ui/primitives/Button";
import { Card } from "@/shared/ui/primitives/Card";
import { getEmptyMessage } from "@/app/layout/getEmptyMessage";
import { ListItemButton } from "@/shared/ui/patterns/ListItemButton";
import { previewText } from "../../utils/previewOneLine";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";

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
  const tagStatsTop10 = useMemo(() => collectTags(logs).slice(0, 10), [logs]);

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

  if (!ready) return <LoadingText label="세션확인중..." />;

  return (
    <>
      {/* Search */}
      <Card variant="panel">
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
          <div className="mt-2 text-sm t5">
            “<span className="t4">{query}</span>” 검색 결과{" "}
            <span className="t3">{logsToRender.length}</span>개
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="soft"
              onClick={() => setOnlyCommented((v) => !v)}
            >
              {onlyCommented ? "전체 글 보기" : "댓글 있는 글만"}
            </Button>

            {selectedTag ? (
              <div className="text-xs t5">
                태그 필터: <span className="t3">#{selectedTag}</span>
              </div>
            ) : null}
          </div>
        )}
      </Card>

      {/* Tag filter (Top10) */}
      {!isSearching && tagStatsTop10.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tagStatsTop10.map(([tag, count]) => (
            <TagChip
              key={tag}
              tag={tag}
              count={count}
              active={selectedTag === tag}
              variant="filter"
              onClick={(t) => setSelectedTag((prev) => (prev === t ? null : t))}
            />
          ))}
        </div>
      ) : null}

      {/* List */}
      <section className="mt-6 space-y-3">
        {logsToRender.map((log) => (
          <ListItemButton
            key={log.id}
            className="surface-1"
            onClick={() => goDetail(log.id)}
            title="상세 보기"
          >
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="min-w-0 flex-1 truncate font-medium t2">
                  {log.title || "(제목 없음)"}
                </h3>

                <div className="shrink-0 flex items-center gap-3 text-xs t5">
                  <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                  <span>💬 {log.commentCount ?? 0}</span>
                  <span>👀 {log.viewCount ?? 0}</span>
                </div>
              </div>

              <p className="mt-2 text-sm t4 leading-relaxed">
                {previewText(log.content, 110)}
              </p>

              {(log.tags ?? []).length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(log.tags ?? []).slice(0, 5).map((t) => (
                    <TagChip key={t} tag={t} variant="display" />
                  ))}
                </div>
              ) : null}
            </div>
          </ListItemButton>
        ))}

        {logsToRender.length === 0 ? (
          <div className="text-sm t5">
            {getEmptyMessage({ isSearching, onlyCommented, selectedTag })}
          </div>
        ) : null}
      </section>

      {/* Search clear */}
      {isSearching ? (
        <div className="mt-6">
          <Button type="button" variant="soft" onClick={() => setQuery("")}>
            검색 지우기
          </Button>
        </div>
      ) : null}
    </>
  );
}
