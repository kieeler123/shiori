import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { loadLogs, saveLogs } from "@/features/shiori/utils/storage";
import type { DbLogRow, LogItem } from "@/features/shiori/type/logs";

import { useSession } from "@/features/auth/useSession";
import { dbList } from "@/features/shiori/repo/shioriRepo";

import TagChip from "@/shared/ui/primitives/TagChip";
import { getEmptyMessage } from "@/app/layout/getEmptyMessage";
import { ListItemButton } from "@/shared/ui/patterns/ListItemButton";
import { previewText } from "../../utils/previewOneLine";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { useShioriSearch } from "../../components/search/SearchContext";

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
    profile: r.profile ? { nickname: r.profile.nickname } : null,
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

function matchQuery(log: LogItem, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;

  const title = (log.title ?? "").toLowerCase();
  const content = (log.content ?? "").toLowerCase();
  const tags = (log.tags ?? []).join(" ").toLowerCase();

  return title.includes(s) || content.includes(s) || tags.includes(s);
}

export default function LogsPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { ready, isAuthed } = useSession();

  /**
   * ✅ 로컬 캐시 전략
   * - 비로그인: 캐시로 즉시 렌더 OK
   * - 로그인: 탈퇴/복구 같은 상태 변화에서 “잔상”이 생길 수 있으니 캐시를 신뢰하지 않음
   */
  const [logs, setLogs] = useState<LogItem[]>(() => {
    return loadLogs(); // 초기엔 그대로 두되, 아래 effect에서 로그인 상태면 정리함
  });

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyCommented, _setOnlyCommented] = useState(false);
  const [pendingNavToFirst, setPendingNavToFirst] = useState(false);

  const refreshFromDb = useCallback(async () => {
    const rows = await dbList();
    const next = rows.map(toLogItem);
    setLogs(next);

    // ✅ 공개 목록 캐시 용도로만 저장 (로그인 상태에선 저장해도 되지만, 잔상 방지하려면 아래처럼 조건 걸어도 됨)
    saveLogs(next);
  }, []);

  /**
   * ✅ 세션 준비되면:
   * - 로그인 상태면: 캐시 잔상 방지 위해 일단 비우고 DB로 동기화
   * - 비로그인이면: 캐시로 유지하면서 DB 동기화
   */
  useEffect(() => {
    if (!ready) return;

    if (isAuthed) {
      // ✅ “탈퇴 직후 잔상/이전 캐시 노출” 방지
      setLogs([]);
      saveLogs([]);
    }

    refreshFromDb().catch(console.error);
  }, [ready, isAuthed, refreshFromDb]);

  // ✅ 다른 페이지에서 돌아오며 refresh 요청
  useEffect(() => {
    const st = (location.state ?? {}) as any;
    if (st?.refresh) {
      refreshFromDb().catch(console.error);
      nav(".", { replace: true, state: {} });
    }
  }, [location.state, refreshFromDb, nav]);

  const tagStatsTop10 = useMemo(() => collectTags(logs).slice(0, 10), [logs]);

  const filteredLogs = useMemo(() => {
    let arr = logs;

    // ❗이 필터는 지금 구조상 거의 의미 없을 수 있음 (profile.is_deleted가 내려오지 않으면 항상 undefined)
    // arr = arr.filter((log) => !(log as any).profile?.is_deleted);

    if (selectedTag) {
      arr = arr.filter((log) => (log.tags ?? []).includes(selectedTag));
    }

    if (onlyCommented) {
      arr = arr.filter((log) => (log.commentCount ?? 0) > 0);
    }

    return arr;
  }, [logs, selectedTag, onlyCommented]);

  const { query } = useShioriSearch();
  const isSearching = query.trim().length > 0;

  const logsToRender = useMemo(() => {
    if (!isSearching) return filteredLogs;
    return filteredLogs.filter((l) => matchQuery(l, query));
  }, [filteredLogs, isSearching, query]);

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
      {isSearching ? (
        <div className="mt-2 text-sm t5">
          “<span className="t4">{query}</span>” 검색 결과{" "}
          <span className="t3">{logsToRender.length}</span>개
        </div>
      ) : null}

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

                <div className="shrink-0 flex items-center gap-3 text-xs t5">
                  <span className="text-sm text-zinc-400">
                    {log.profile?.nickname ?? "익명"}
                  </span>
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
    </>
  );
}
