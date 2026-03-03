import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { cn } from "@/shared/ui/utils/cn";
import { Button } from "@/shared/ui/primitives/Button";

import {
  dbAdminCounts,
  dbAdminListPublic,
  dbAdminListRaw,
  dbAdminListHiddenDuplicates,
} from "@/features/shiori/repo/adminRepo";

type Tab = "public" | "raw" | "hiddenDup";

type Row = {
  id: string;
  user_id?: string;
  title?: string;
  created_at?: string;
  source_date?: string;
  view_count?: number;
  comment_count?: number;
  tags?: any;
  is_deleted?: boolean;
  is_hidden?: boolean;
  duplicate_of?: string | null;
};

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4",
        className,
      )}
    >
      <div className="text-sm font-medium text-[var(--text-2)]">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function chip(text: string) {
  return (
    <span className="rounded-full border border-[var(--border-soft)] bg-[var(--bg-elev-1)] px-2 py-[2px] text-[11px] text-[var(--text-5)]">
      {text}
    </span>
  );
}

function asTagList(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string")
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

export default function AdminDataPage() {
  const { t } = useI18n();
  const nav = useNavigate();

  const [tab, setTab] = useState<Tab>("public");
  const [counts, setCounts] = useState({
    raw: 0,
    public: 0,
    hiddenDuplicates: 0,
  });

  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const title = useMemo(() => {
    if (tab === "public") return t("admin.data.tabs.public");
    if (tab === "raw") return t("admin.data.tabs.raw");
    return t("admin.data.tabs.hiddenDup");
  }, [tab, t]);

  async function load() {
    setErr(null);
    setBusy(true);
    try {
      const c = await dbAdminCounts();
      setCounts(c);

      const offset = page * PAGE_SIZE;

      if (tab === "public") {
        setRows(await dbAdminListPublic({ limit: PAGE_SIZE, offset }));
      } else if (tab === "raw") {
        setRows(await dbAdminListRaw({ limit: PAGE_SIZE, offset }));
      } else {
        setRows(
          await dbAdminListHiddenDuplicates({ limit: PAGE_SIZE, offset }),
        );
      }
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  // ✅ 탭/페이지 바뀌면 다시 로드
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-[var(--text-2)]">
            {t("admin.data.title")}
          </div>
          <div className="mt-1 text-sm text-[var(--text-5)]">{title}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => nav("/admin")}>
            ← {t("admin.data.backToDashboard")}
          </Button>
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? t("common.loading") : t("common.refresh")}
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card title={t("admin.data.kpi.raw")}>
          <div className="text-2xl font-semibold text-[var(--text-2)]">
            {counts.raw}
          </div>
          <div className="mt-1 text-xs text-[var(--text-5)]">
            {t("admin.data.kpiDesc.raw")}
          </div>
        </Card>

        <Card title={t("admin.data.kpi.public")}>
          <div className="text-2xl font-semibold text-[var(--text-2)]">
            {counts.public}
          </div>
          <div className="mt-1 text-xs text-[var(--text-5)]">
            {t("admin.data.kpiDesc.public")}
          </div>
        </Card>

        <Card title={t("admin.data.kpi.hiddenDup")}>
          <div className="text-2xl font-semibold text-[var(--text-2)]">
            {counts.hiddenDuplicates}
          </div>
          <div className="mt-1 text-xs text-[var(--text-5)]">
            {t("admin.data.kpiDesc.hiddenDup")}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={tab === "public" ? "nav" : "ghost"}
          onClick={() => {
            setPage(0);
            setTab("public");
          }}
        >
          {t("admin.data.tabs.public")}
        </Button>

        <Button
          variant={tab === "raw" ? "nav" : "ghost"}
          onClick={() => {
            setPage(0);
            setTab("raw");
          }}
        >
          {t("admin.data.tabs.raw")}
        </Button>

        <Button
          variant={tab === "hiddenDup" ? "nav" : "ghost"}
          onClick={() => {
            setPage(0);
            setTab("hiddenDup");
          }}
        >
          {t("admin.data.tabs.hiddenDup")}
        </Button>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800/60">
        {err ? <div className="p-4 text-sm text-red-300">{err}</div> : null}

        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/40 text-xs text-[var(--text-5)]">
            <tr>
              <th className="px-3 py-2">{t("admin.data.col.title")}</th>
              <th className="px-3 py-2 w-28">{t("admin.data.col.date")}</th>
              <th className="px-3 py-2 w-24">{t("admin.data.col.views")}</th>
              <th className="px-3 py-2 w-24">{t("admin.data.col.comments")}</th>
              <th className="px-3 py-2">{t("admin.data.col.tags")}</th>
              {tab !== "public" ? (
                <th className="px-3 py-2 w-40">{t("admin.data.col.flags")}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !busy ? (
              <tr>
                <td
                  colSpan={tab !== "public" ? 6 : 5}
                  className="px-3 py-6 text-center text-[var(--text-5)]"
                >
                  {t("admin.data.empty")}
                </td>
              </tr>
            ) : null}

            {rows.map((r) => {
              const tags = asTagList(r.tags).slice(0, 6);
              const date = (r.source_date ?? r.created_at ?? "").slice(0, 10);

              return (
                <tr
                  key={r.id}
                  className="border-t border-zinc-800/40 hover:bg-zinc-950/30"
                >
                  <td className="px-3 py-2">
                    <button
                      className="text-left text-[var(--text-2)] hover:underline"
                      onClick={() => nav(`/logs/${r.id}`)}
                      title={r.id}
                    >
                      {r.title || "(no title)"}
                    </button>
                    <div className="mt-1 text-[11px] text-[var(--text-5)]">
                      {r.id}
                    </div>
                  </td>

                  <td className="px-3 py-2 text-[var(--text-5)]">{date}</td>
                  <td className="px-3 py-2 text-[var(--text-5)]">
                    {r.view_count ?? 0}
                  </td>
                  <td className="px-3 py-2 text-[var(--text-5)]">
                    {r.comment_count ?? 0}
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t0) => (
                        <span key={t0}>{chip(`#${t0}`)}</span>
                      ))}
                      {asTagList(r.tags).length > tags.length
                        ? chip("…")
                        : null}
                    </div>
                  </td>

                  {tab !== "public" ? (
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {r.is_deleted ? chip("deleted") : null}
                        {r.is_hidden ? chip("hidden") : null}
                        {r.duplicate_of ? chip("dup") : null}
                      </div>
                      {r.duplicate_of ? (
                        <div className="mt-1 text-[11px] text-[var(--text-5)]">
                          dup_of: {String(r.duplicate_of).slice(0, 8)}…
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pager */}
        <div className="flex items-center justify-between gap-2 border-t border-zinc-800/40 bg-zinc-950/20 p-2">
          <div className="text-xs text-[var(--text-5)]">
            {t("admin.data.page")} {page + 1}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              disabled={busy || page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t("common.prev")}
            </Button>
            <Button
              variant="ghost"
              disabled={busy || rows.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
