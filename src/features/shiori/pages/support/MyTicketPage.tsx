import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
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
import { dbMyTicketsPage } from "../../repo/supportRepo";

export default function MyTicketsPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();
  const { t, locale } = useI18n();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
    fetchPage: ({ limit, offset }) => dbMyTicketsPage({ limit, offset }),
    mapRow: (r) => r,
    mergeKey: (r) => r.id,
    key: "admin-support-list",
  });

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: ready && isAuthed && hasMore && !busyMore,
    onLoadMore: loadNextPage,
    rootMargin: "240px",
    threshold: 0.01,
  });

  // ✅ ready + isAuthed 기준으로 로드(로그인 후 재진입/재로그인 대응)
  useEffect(() => {
    if (!ready) return;

    if (!isAuthed) {
      resetPaging();
      return;
    }

    resetPaging();
    loadFirstPage("initial").catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isAuthed]);

  if (!ready) return <LoadingText label={t("common.sessionChecking")} />;

  if (!isAuthed) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-[var(--text-sub)]">
          {t("support.mine.loginRequired")}
        </div>
        <AuthPanel />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Button variant="soft" onClick={() => nav("/support")}>
          {t("support.nav.all")}
        </Button>

        <div className="text-xs t5">
          {initialLoading
            ? t("common.loading")
            : `${formatCount(rows.length, locale)}${t("support.countUnit")}`}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {initialLoading && rows.length === 0 ? (
          <LoadingText size="sm" />
        ) : rows.length === 0 ? (
          <EmptyState>{t("support.mine.empty")}</EmptyState>
        ) : (
          rows.map((r) => (
            <ListItemButton
              key={r.id}
              onClick={() => nav(`/support/${r.id}`)}
              title={t("common.openDetail")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm t2">
                    {r.title || t("common.noTitle")}
                  </div>

                  <div className="mt-1 text-xs t4 line-clamp-1">
                    {previewText(r.body, 200)}
                  </div>

                  <div className="mt-1 text-xs t5">
                    {formatDateTime(r.created_at, locale)}
                  </div>
                </div>

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
      </div>

      {refreshing ? (
        <div className="mt-2">
          <LoadingText size="sm" label={t("common.refreshing")} />
        </div>
      ) : null}
    </>
  );
}
