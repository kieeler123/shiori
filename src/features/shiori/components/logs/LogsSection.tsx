import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dbListRelatedLogs } from "@/features/shiori/repo/logsRepo";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { sortKeyToLabelKey, type RelatedLogSort } from "../../utils/logSort";
import type { LogListItem, LogSort } from "../../type";
import { shouldHideFromList } from "../../utils/logFilters";

type Props = {
  currentLogId: string;
  limit?: number;
  title?: string;
  userId?: string | null;
};

async function fetchVisibleRelatedLogs(params: {
  currentLogId: string;
  userId?: string | null;
  sort: LogSort;
  targetCount: number;
}) {
  const { currentLogId, userId, sort, targetCount } = params;

  const collected: LogListItem[] = [];
  let offset = 0;
  const batchSize = 10;
  const maxRounds = 5;

  for (let round = 0; round < maxRounds; round++) {
    const rows = await dbListRelatedLogs({
      excludeId: currentLogId,
      userId,
      limit: batchSize,
      offset,
      sort,
    });

    if (rows.length === 0) break;

    const visible = rows.filter((it) => !shouldHideFromList(it));

    for (const row of visible) {
      if (!collected.some((x) => x.id === row.id)) {
        collected.push(row);
      }
    }

    if (collected.length >= targetCount) break;

    offset += batchSize;
  }

  return collected.slice(0, targetCount);
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default function LogsSection({
  currentLogId,
  limit = 5,
  userId,
}: Props) {
  const [items, setItems] = useState<LogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [sort, setSort] = useState<RelatedLogSort>("recent");

  const { t } = useI18n();

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErr(null);

      try {
        const rows = await fetchVisibleRelatedLogs({
          currentLogId,
          userId,
          sort,
          targetCount: limit,
        });
        setItems(rows);

        console.log("raw related rows", rows);

        const visibleRows = rows.filter((it) => !shouldHideFromList(it));

        console.log("visible related rows", visibleRows);

        if (!alive) return;
        setItems(visibleRows);

        if (!alive) return;
        setItems(rows.filter((it) => !shouldHideFromList(it)));
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setErr("error");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [currentLogId, userId, limit, sort]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold t2">
          {t("logs.related.title")}
        </h2>
      </div>
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          className="cursor-pointer text-sm t5 transition hover:[color:var(--text-3)]"
          onClick={() => {
            console.log("sort button clicked");
            setSort((s) => (s === "recent" ? "views" : "recent"));
          }}
          title={t("logs.sort.change")}
        >
          {t("logs.related.sortLabel")}: {t(sortKeyToLabelKey(sort))}
        </button>
      </div>

      {loading ? (
        <LoadingText className="text-sm t5">
          {t("logs.related.loading")}
        </LoadingText>
      ) : err ? (
        <div className="text-sm" style={{ color: "var(--btn-danger-fg)" }}>
          {t("logs.related.error")}
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm t5">{t("logs.related.empty")}</div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={`/logs/${item.id}`}
                className="recent-log-link group flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium t2">
                    {item.title || "(제목 없음)"}
                  </div>
                </div>

                <div className="shrink-0 text-xs t5">
                  {sort === "views"
                    ? `${item.view_count ?? 0} ${t("logs.related.viewsSuffix")}`
                    : formatDate(item.display_date ?? item.created_at)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
