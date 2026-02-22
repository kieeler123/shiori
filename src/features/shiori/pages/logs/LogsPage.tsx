import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { loadLogs, saveLogs } from "@/features/shiori/utils/storage";
import type { DbLogRow, LogItem } from "@/features/shiori/type/logs";

import { useSession } from "@/features/auth/useSession";

import TagChip from "@/shared/ui/primitives/TagChip";
import { getEmptyMessage } from "@/app/layout/getEmptyMessage";
import { ListItemButton } from "@/shared/ui/patterns/ListItemButton";
import { previewText } from "../../utils/previewOneLine";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { useShioriSearch } from "../../components/search/SearchContext";
import { dbListPage } from "../../repo/shioriRepo";
import { highlightText } from "@/shared/utils/highlight";

function pickProfileNickname(p: any): { nickname: string | null } | null {
  if (!p) return null;
  if (Array.isArray(p)) {
    const first = p[0];
    return first ? { nickname: first.nickname ?? null } : null;
  }
  return { nickname: p.nickname ?? null };
}

function toLogItem(r: DbLogRow): LogItem {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    content: r.content,
    tags: Array.isArray(r.tags) ? r.tags : [],

    createdAt: r.created_at,
    updatedAt: r.updated_at ?? null,

    commentCount: r.comment_count ?? 0,
    viewCount: r.view_count ?? 0,

    sourceDate: r.source_date ?? null,

    profile: pickProfileNickname((r as any).profile),
  };
}

export function formatYmd(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

function shouldHideFromList(log: { title?: string; content?: string }) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();
  return title.length === 0 || content.length === 0; // 둘 중 하나라도 비면 숨김
}

const PAGE_SIZE = 10;

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

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadNextPage = useCallback(async () => {
    if (busy) return;
    if (!hasMore) return;

    setBusy(true);
    try {
      const rows = await dbListPage({
        limit: PAGE_SIZE,
        offset,
        orderBy: "source_date",
        ascending: false,
      });

      const next = rows.map(toLogItem);

      // ✅ 혹시 중복 방지 (방어)
      setLogs((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const merged = [...prev];
        for (const it of next) if (!seen.has(it.id)) merged.push(it);
        return merged;
      });

      // ✅ 다음 offset
      setOffset((v) => v + rows.length);

      // ✅ 더 가져올게 없으면 stop
      if (rows.length < PAGE_SIZE) setHasMore(false);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }, [busy, hasMore, offset]);

  // ✅ 최초 1페이지 로드
  useEffect(() => {
    // 초기화 + 첫 페이지
    setLogs([]);
    setOffset(0);
    setHasMore(true);

    // offset 0 기준으로 바로 로드
    (async () => {
      setBusy(true);
      try {
        const rows = await dbListPage({
          limit: PAGE_SIZE,
          offset: 0,
          orderBy: "source_date",
          ascending: false,
        });
        setLogs(rows.map(toLogItem));
        setOffset(rows.length);
        if (rows.length < PAGE_SIZE) setHasMore(false);
      } catch (e) {
        console.error(e);
      } finally {
        setBusy(false);
      }
    })();
  }, []); // 필요하면 ready/isAuthed 변화에 맞춰 초기화

  // ✅ 스크롤 끝 감지
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          loadNextPage();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.01 }, // ✅ 200px 전에 미리 로드
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loadNextPage]);

  const refreshFromDb = useCallback(async () => {
    const rows = await dbListPage();
    const next = rows.map(toLogItem);
    const cleaned = next.filter((it) => !shouldHideFromList(it));
    setLogs(cleaned);
    saveLogs(cleaned);
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
        {logsToRender.map((log) => {
          const displayDate = log.sourceDate ?? log.createdAt;
          return (
            <ListItemButton
              key={log.id}
              className="surface-1"
              onClick={() => goDetail(log.id)}
              title="상세 보기"
            >
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="min-w-0 flex-1 truncate font-medium t2">
                    {highlightText(log.title || "(제목 없음)", query)}
                  </h3>

                  <div className="shrink-0 flex items-center gap-3 text-xs t5">
                    <span>{formatYmd(displayDate)}</span>
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
                  {highlightText(previewText(log.content, 110), query)}
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
          );
        })}

        {/* ✅ 로딩/끝 표시 */}
        <div ref={sentinelRef} />

        {busy ? (
          <div className="py-4 text-center text-xs t5">loading...</div>
        ) : null}

        {!hasMore && logsToRender.length > 0 ? (
          <div className="py-6 text-center text-xs t5">끝</div>
        ) : null}

        {logsToRender.length === 0 && !busy ? (
          <div className="text-sm t5">
            {getEmptyMessage({ isSearching, onlyCommented, selectedTag })}
          </div>
        ) : null}
      </section>
    </>
  );
}
