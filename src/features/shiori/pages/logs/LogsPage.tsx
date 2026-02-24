import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  useDeferredValue,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { loadLogs, saveLogs } from "@/features/shiori/utils/storage";
import type { DbLogRow, LogItem } from "@/features/shiori/type/logs";

import { useSession } from "@/features/auth/useSession";

import TagChip from "@/shared/ui/primitives/TagChip";
import { getEmptyMessage } from "@/app/layout/getEmptyMessage";
import { ListItemButton } from "@/shared/ui/patterns/ListItemButton";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { useShioriSearch } from "../../components/search/SearchContext";
import { dbListPage } from "../../repo/shioriRepo";
import { highlightText } from "@/shared/utils/highlight";
import { Button } from "@/shared/ui/primitives/Button";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { snippetAroundQuery } from "@/shared/utils/searchSnippet";

/* ----------------- helpers ----------------- */

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
    for (const t of log.tags ?? []) map.set(t, (map.get(t) ?? 0) + 1);
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

function shouldHideFromList(log: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();

  // DB에서 걸렀다고 가정하지만, 방어적으로 유지
  if (title.length < 2) return true;
  if (content.length < 30) return true;

  // (선택) 프론트에서만 추가로 거르고 싶은 룰
  // - 너무 많은 반복 문자
  const repeated = /(.)\1{9,}/; // 같은 문자 10번 이상
  if (repeated.test(title) || repeated.test(content)) return true;

  // - test 태그(혹시 DB에서 누락됐을 때)
  if ((log.tags ?? []).includes("test")) return true;

  return false;
}

const PAGE_SIZE = 10;

type LogsTab = "all" | "mine";
type SortKey = "recent" | "views" | "comments";

function toOrderBy(sort: SortKey) {
  return sort === "recent"
    ? "source_date"
    : sort === "views"
      ? "view_count"
      : "comment_count";
}

function sortLabel(sort: SortKey) {
  return sort === "recent" ? "최신" : sort === "views" ? "조회" : "댓글";
}

/* ----------------- page ----------------- */

export default function LogsPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { ready, isAuthed, userId } = useSession();

  // ✅ 캐시를 바로 보여줘서 첫 진입 깜빡임 최소화
  const [logs, setLogs] = useState<LogItem[]>(() => loadLogs()); // 일단 캐시

  const [tab, setTab] = useState<LogsTab>("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyCommented] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ✅ 로딩 상태를 분리해서 깜빡임/리셋을 없앰
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyMore, setBusyMore] = useState(false);

  // 사고 흐름(현재는 로컬, 나중에 AI 출력으로 교체)
  const [oneLiner] = useState(
    () => localStorage.getItem("shiori_one_liner") ?? "",
  );

  // ✅ 검색은 deferred 기준으로 리스트/헤더/하이라이트까지 통일
  const { query } = useShioriSearch();
  const deferredQuery = useDeferredValue(query);
  const isSearching = deferredQuery.trim().length > 0;

  // ✅ DB 1페이지 로드(교체만 하고, 절대 비우지 않음)
  const loadFirstPage = useCallback(
    async (reason: "initial" | "refresh" = "refresh") => {
      const orderBy = toOrderBy(sort);

      if (reason === "initial") setInitialLoading(true);
      else setRefreshing(true);

      try {
        const rows = await dbListPage({
          limit: PAGE_SIZE,
          offset: 0,
          orderBy,
          ascending: false,
          userId: tab === "mine" ? (userId ?? undefined) : undefined,
        });

        const next = rows
          .map(toLogItem)
          .filter((it) => !shouldHideFromList(it));

        setLogs(next);
        setOffset(rows.length);
        setHasMore(rows.length >= PAGE_SIZE);

        if (tab === "all" && sort === "recent") saveLogs(next);
      } catch (e) {
        console.error(e);
      } finally {
        if (reason === "initial") setInitialLoading(false);
        else setRefreshing(false);
      }
    },
    [sort, tab, userId],
  );

  // ✅ 다음 페이지 로드(무한스크롤)
  const loadNextPage = useCallback(async () => {
    if (busyMore) return;
    if (!hasMore) return;

    setBusyMore(true);
    try {
      const orderBy = toOrderBy(sort);

      const rows = await dbListPage({
        limit: PAGE_SIZE,
        offset,
        orderBy,
        ascending: false,
        userId: tab === "mine" ? (userId ?? undefined) : undefined,
      });

      const next = rows.map(toLogItem).filter((it) => !shouldHideFromList(it));

      setLogs((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const merged = [...prev];
        for (const it of next) if (!seen.has(it.id)) merged.push(it);
        if (tab === "all") saveLogs(merged);
        return merged;
      });

      setOffset((v) => v + rows.length);
      if (rows.length < PAGE_SIZE) setHasMore(false);
    } catch (e) {
      console.error(e);
    } finally {
      setBusyMore(false);
    }
  }, [busyMore, hasMore, offset, sort, tab, userId]);

  // ✅ 최초 진입: 캐시를 보여주고, 뒤에서 DB로 교체
  useEffect(() => {
    if (!ready) return;
    loadFirstPage("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // ✅ 탭/정렬/유저 변경: 리셋 없이 교체 로딩만
  useEffect(() => {
    if (!ready) return;
    setSelectedTag(null);
    setOffset(0);
    setHasMore(true);
    loadFirstPage("refresh");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tab, sort, userId]);

  // ✅ 다른 페이지에서 돌아오며 refresh 요청
  useEffect(() => {
    const st = (location.state ?? {}) as any;
    if (!st?.refresh) return;

    loadFirstPage("refresh").catch(console.error);
    nav(".", { replace: true, state: {} });
  }, [location.state, loadFirstPage, nav]);

  // ✅ 스크롤 끝 감지
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) loadNextPage();
      },
      { root: null, rootMargin: "240px", threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loadNextPage]);

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

  const logsToRender = useMemo(() => {
    if (!isSearching) return filteredLogs;
    return filteredLogs.filter((l) => matchQuery(l, deferredQuery));
  }, [filteredLogs, isSearching, deferredQuery]);

  function goDetail(id: string) {
    nav(`/logs/${id}`);
  }

  if (!ready) return <LoadingText label="세션확인중..." />;

  return (
    <>
      {/* 1) TopTags */}
      {tagStatsTop10.length > 0 ? (
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

      {/* 사고 흐름 (지금은 로컬, 나중에 AI 출력 자리) */}
      <section className="mt-6">
        <SurfaceCard tone="soft">
          <div className="text-xs t5 mb-1">사고 흐름</div>
          <div className="text-sm t3 leading-relaxed">
            {oneLiner || "기록이 쌓이면 사고 흐름이 여기에 나타납니다."}
          </div>
        </SurfaceCard>
      </section>

      {/* 상단 바: 탭 + 정렬(상태형) + 새 기록 */}
      <section className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        {/* Left: Tabs */}
        <div className="flex items-baseline gap-2">
          <Button
            variant={tab === "all" ? "nav" : "ghost"}
            onClick={() => setTab("all")}
          >
            전체
          </Button>
          <Button
            variant={tab === "mine" ? "nav" : "ghost"}
            onClick={() => setTab("mine")}
            disabled={!isAuthed}
            title={!isAuthed ? "로그인 후 사용 가능" : undefined}
          >
            내 글
          </Button>
        </div>

        {/* 얇은 로딩(리셋 대신 표시만) */}
        {refreshing ? (
          <div className="mt-2">
            <LoadingText size="sm" label="화면을 갱신하는 중…" />
          </div>
        ) : null}

        {/* Right: Sort text + New */}
        <div className="flex items-baseline gap-2">
          <button
            className="cursor-pointer text-sm t5 hover:text-[var(--text-3)] transition"
            onClick={() =>
              setSort((s) =>
                s === "recent"
                  ? "views"
                  : s === "views"
                    ? "comments"
                    : "recent",
              )
            }
            title="정렬 변경"
            type="button"
          >
            정렬: {sortLabel(sort)}
          </button>

          <Button
            variant="soft"
            onClick={() => {
              if (!isAuthed)
                return nav("/auth", { state: { next: "/logs/new" } });
              nav("/logs/new");
            }}
          >
            + 새 기록
          </Button>
        </div>
      </section>

      {/* ✅ 검색 결과 헤더는 "탭/정렬 아래"에 1번만 */}
      {isSearching ? (
        <div className="mt-2 text-sm t5">
          “<span className="t4">{deferredQuery}</span>” 검색 결과{" "}
          <span className="t3">{logsToRender.length}</span>개
        </div>
      ) : null}

      {/* 4) List */}
      <section className="mt-6 space-y-3 min-h-[40vh]">
        {initialLoading && logs.length === 0 ? (
          <LoadingText label="기록을 불러오는 중…" />
        ) : null}

        {logsToRender.map((log) => {
          const displayDate = log.sourceDate ?? log.createdAt;

          const contentText = isSearching
            ? snippetAroundQuery(log.content ?? "", query, {
                radius: 70,
                maxLen: 160,
              })
            : (log.content ?? "");

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
                    {highlightText(log.title || "(제목 없음)", deferredQuery)}
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

                <p className="mt-2 text-sm t4 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {highlightText(contentText, query, "body")}
                </p>

                {(log.tags ?? []).length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(log.tags ?? []).slice(0, 5).map((t) => (
                      <TagChip
                        key={t}
                        tag={highlightText(t, query, "tag") as any}
                        variant="display"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </ListItemButton>
          );
        })}

        {/* 무한스크롤 sentinel */}
        <div ref={sentinelRef} />

        {busyMore ? (
          <div className="py-4">
            <LoadingText align="center" size="sm" label="더 불러오는 중…" />
          </div>
        ) : null}

        {!hasMore && logsToRender.length > 0 ? (
          <div className="py-6">
            <LoadingText align="center" size="sm" label="끝" />
          </div>
        ) : null}

        {logsToRender.length === 0 && !initialLoading && !refreshing ? (
          <div className="text-sm t5">
            {getEmptyMessage({
              isSearching,
              onlyCommented,
              selectedTag,
            })}
          </div>
        ) : null}
      </section>
    </>
  );
}
