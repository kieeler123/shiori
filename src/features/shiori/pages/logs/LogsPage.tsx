import { useMemo, useState, useRef, useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";

import { saveLogs } from "@/features/shiori/utils/storage";
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
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import { InfiniteListFooter } from "@/shared/ui/patterns/InfiniteListFooter";
import { PAGE_SIZE, usePagedList } from "@/shared/hooks/usePagedList";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { formatCount } from "@/shared/i18n/format";
import { nextLogSort } from "../../utils/logSort";
import { shouldHideFromList } from "../../utils/logFilters";

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

type LogsTab = "all" | "mine";
type SortKey = "recent" | "views" | "comments";

function toOrderBy(sort: SortKey) {
  return sort === "recent"
    ? "display_date"
    : sort === "views"
      ? "view_count"
      : "comment_count";
}

function sortKeyToLabelKey(sort: SortKey) {
  return sort === "recent"
    ? "logs.sort.recent"
    : sort === "views"
      ? "logs.sort.views"
      : "logs.sort.comments";
}

/* ----------------- page ----------------- */

export default function LogsPage() {
  const nav = useNavigate();
  const { ready, isAuthed, userId } = useSession();

  const [tab, setTab] = useState<LogsTab>("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyCommented] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { t, locale } = useI18n();

  // 사고 흐름(현재는 로컬, 나중에 AI 출력으로 교체)
  const [oneLiner] = useState(
    () => localStorage.getItem("shiori_one_liner") ?? "",
  );

  // ✅ 검색은 deferred 기준으로 리스트/헤더/하이라이트까지 통일
  const { query } = useShioriSearch();
  const deferredQuery = useDeferredValue(query);
  const isSearching = deferredQuery.trim().length > 0;

  const listKey = `${tab}:${sort}:${userId ?? "guest"}`;

  console.log("SORT", sort, "ORDER BY", toOrderBy(sort));

  const {
    items: logs,
    hasMore,
    initialLoading,
    refreshing,
    busyMore,
    loadNextPage,
  } = usePagedList<DbLogRow, LogItem>({
    pageSize: PAGE_SIZE,
    key: listKey,
    fetchPage: ({ limit, offset }) =>
      dbListPage({
        limit,
        offset,
        orderBy: toOrderBy(sort),
        ascending: false,
        userId: tab === "mine" ? (userId ?? undefined) : undefined,
      }),
    mapRow: toLogItem,
    filterItem: (it) => !shouldHideFromList(it),
    mergeKey: (it) => it.id,
    onCacheSave:
      tab === "all" && sort === "recent" ? (arr) => saveLogs(arr) : undefined,
  });

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: ready && hasMore && !busyMore,
    onLoadMore: loadNextPage,
    rootMargin: "240px",
    threshold: 0.01,
  });

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

  if (!ready) return <LoadingText label={t("common.sessionChecking")} />;

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
            >
              <>
                <span className="opacity-80">#</span>
                <span>{tag}</span>
                {selectedTag === tag && (
                  <span className="ml-1 opacity-60">×</span>
                )}
              </>
            </TagChip>
          ))}
        </div>
      ) : null}

      {/* 사고 흐름 (지금은 로컬, 나중에 AI 출력 자리) */}
      <section className="mt-6">
        <SurfaceCard tone="soft">
          <div className="text-xs t5 mb-1">{t("logs.oneLiner.title")}</div>
          <div className="text-sm t3 leading-relaxed">
            {oneLiner || t("logs.oneLiner.empty")}
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
            {t("logs.tab.all")}
          </Button>
          <Button
            variant={tab === "mine" ? "nav" : "ghost"}
            onClick={() => setTab("mine")}
            disabled={!isAuthed}
            title={!isAuthed ? t("logs.tab.mineDisabledHint") : undefined}
          >
            {t("logs.tab.mine")}
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
            type="button"
            className="cursor-pointer text-sm t5 transition hover:[color:var(--text-3)]"
            onClick={() => setSort((s) => nextLogSort(s))}
            title={t("logs.sort.change")}
          >
            {t("logs.related.sortLabel")}: {t(sortKeyToLabelKey(sort))}
          </button>

          <Button
            variant="soft"
            onClick={() => {
              if (!isAuthed)
                return nav("/auth", { state: { next: "/logs/new" } });
              nav("/logs/new");
            }}
          >
            {t("logs.new.title")}
          </Button>
        </div>
      </section>

      {/* ✅ 검색 결과 헤더는 "탭/정렬 아래"에 1번만 */}
      {isSearching ? (
        <div className="mt-2 text-sm t5">
          {t("logs.search.result", {
            q: deferredQuery,
            n: formatCount(logsToRender.length, locale),
          })}
        </div>
      ) : null}

      {/* 4) List */}
      <section className="mt-6 space-y-3 min-h-[40vh]">
        {initialLoading && logs.length === 0 ? (
          <LoadingText label={t("logs.loading")} />
        ) : null}

        {logsToRender.map((log) => {
          const displayDate = log.sourceDate ?? log.createdAt;

          const contentText = isSearching
            ? snippetAroundQuery(log.content ?? "", deferredQuery, {
                radius: 70,
                maxLen: 160,
              })
            : (log.content ?? "");

          return (
            <ListItemButton
              key={log.id}
              className="surface-1"
              onClick={() => goDetail(log.id)}
              title={t("common.viewDetail")}
            >
              <div className="min-w-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="min-w-0 font-semibold t2 text-base sm:text-lg leading-snug line-clamp-1">
                    {highlightText(
                      log.title || t("common.noTitle"),
                      deferredQuery,
                    )}
                  </h3>
                </div>

                <p className="mt-2 text-sm t4 leading-relaxed line-clamp-2 opacity-90">
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

                {/* meta */}
                <div className="mt-4 text-xs t5">
                  {/* mobile layout */}
                  <div className="flex flex-col gap-1 sm:hidden">
                    <span className="truncate">
                      {log.profile?.nickname ?? t("common.anonymous")}
                    </span>

                    <div className="flex items-center gap-3">
                      <span>{formatYmd(displayDate)}</span>
                      <span>💬 {log.commentCount ?? 0}</span>
                      <span>👀 {log.viewCount ?? 0}</span>
                    </div>
                  </div>

                  {/* desktop layout */}
                  <div className="hidden sm:flex items-center gap-3">
                    <span className="truncate max-w-[12rem]">
                      {log.profile?.nickname ?? t("common.anonymous")}
                    </span>

                    <span className="opacity-60">·</span>

                    <span>{formatYmd(displayDate)}</span>

                    <span className="opacity-60">·</span>

                    <span>💬 {log.commentCount ?? 0}</span>

                    <span className="opacity-60">·</span>

                    <span>👀 {log.viewCount ?? 0}</span>
                  </div>
                </div>
              </div>
            </ListItemButton>
          );
        })}

        <InfiniteListFooter
          sentinelRef={sentinelRef}
          busyMore={busyMore}
          hasMore={hasMore}
          hasAny={logsToRender.length > 0}
          loadingLabel={t("common.loadingMore")}
          endLabel={t("common.end")}
          empty={
            !initialLoading && !refreshing ? (
              <div className="text-sm t5">
                {getEmptyMessage({ isSearching, onlyCommented, selectedTag })}
              </div>
            ) : null
          }
        />
      </section>
    </>
  );
}
