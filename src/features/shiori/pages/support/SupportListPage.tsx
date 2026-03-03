import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";

import { dbSupportListPage } from "@/features/shiori/repo/supportRepo";
import type { SupportTicketListRow } from "../../type";

import { Button } from "@/shared/ui/primitives/Button";
import TagChip from "@/shared/ui/primitives/TagChip";
import { ListItemButton } from "@/shared/ui/patterns/ListItemButton";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { formatDateTime, formatCount } from "@/shared/i18n/format";

import { PAGE_SIZE, usePagedList } from "@/shared/hooks/usePagedList";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import { InfiniteListFooter } from "@/shared/ui/patterns/InfiniteListFooter";

import { previewText } from "../../utils/previewOneLine";

export default function SupportListPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();
  const { t, locale } = useI18n();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const startedRef = useRef(false);

  const {
    items: rows,
    hasMore,
    initialLoading,
    refreshing,
    busyMore,
    loadFirstPage,
    loadNextPage,
    resetPaging,
  } = usePagedList<SupportTicketListRow, SupportTicketListRow>({
    pageSize: PAGE_SIZE,
    fetchPage: ({ limit, offset }) => dbSupportListPage({ limit, offset }),
    mapRow: (r) => r,
    mergeKey: (r) => r.id,
    key: "admin-support-list",
  });

  // 무한스크롤
  useInfiniteScrollSentinel(sentinelRef, {
    enabled: ready && hasMore && !busyMore,
    onLoadMore: loadNextPage,
    rootMargin: "240px",
    threshold: 0.01,
  });

  // 최초 로드(정말 1회만)
  useEffect(() => {
    if (!ready) return;
    if (startedRef.current) return; // ✅ StrictMode/dev 중복 방지
    startedRef.current = true;

    resetPaging();
    loadFirstPage("initial").catch(console.error);
  }, [ready, resetPaging, loadFirstPage]);

  if (!ready) return <LoadingText label={t("common.sessionChecking")} />;

  const countLabel =
    rows.length > 0
      ? `${formatCount(rows.length, locale)}${t("support.countUnit")}`
      : initialLoading
        ? t("common.loading")
        : `0${t("support.countUnit")}`;

  return (
    <section className="mt-6 space-y-3">
      {/* Top actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs t5">{countLabel}</div>

        <div className="flex flex-wrap gap-2">
          <Button variant="soft" onClick={() => nav("/support/mine")}>
            {t("support.nav.mine")}
          </Button>

          <Button variant="soft" onClick={() => nav("/support/trash")}>
            {t("support.nav.trash")}
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              if (!isAuthed)
                return nav("/auth", { state: { next: "/support/new" } });
              nav("/support/new");
            }}
          >
            {t("support.nav.new")}
          </Button>
        </div>
      </div>

      {/* Auth hint */}
      {!isAuthed ? (
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-4">
          <div className="text-sm text-[var(--text-sub)] mb-3">
            {t("support.list.loginHint")}
          </div>
          <AuthPanel />
        </div>
      ) : null}

      {/* List */}
      <div className="mt-6 space-y-3 min-h-[40vh]">
        {initialLoading && rows.length === 0 ? (
          <LoadingText label={t("common.loading")} />
        ) : rows.length === 0 ? (
          <EmptyState>{t("support.list.empty")}</EmptyState>
        ) : (
          rows.map((r) => (
            <ListItemButton
              key={r.id}
              className="surface-1"
              onClick={() => nav(`/support/${r.id}`)}
              title={t("common.openDetail")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm t2">
                    {r.title || t("common.noTitle")}
                  </div>

                  {/* ✅ 1줄 미리보기(원하면 line-clamp-2로 변경 가능) */}
                  {r.body ? (
                    <div className="mt-1 text-xs t4 line-clamp-1">
                      {previewText(r.body, 220)}
                    </div>
                  ) : null}

                  <div className="mt-1 text-xs t5">
                    {r.nickname} · {formatDateTime(r.created_at, locale)}
                  </div>
                </div>

                {/* 상태 배지 */}
                <TagChip variant="display" size="sm" active>
                  {t(`support.status.${r.status}`)}
                </TagChip>
              </div>
            </ListItemButton>
          ))
        )}

        <InfiniteListFooter
          sentinelRef={sentinelRef}
          busyMore={busyMore}
          hasMore={hasMore}
          hasAny={rows.length > 0}
          loadingLabel={t("common.loadingMore")}
          endLabel={t("common.end")}
        />

        {refreshing ? (
          <div className="py-2">
            <LoadingText size="sm" label={t("common.refreshing")} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
