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
  dbAdminListTrash,
} from "../repo/adminRepo";
import { AdminKpi } from "../ui/AdminKpi";
import { AdminSection } from "../ui/AdminSection";

type Tab = "public" | "raw" | "hiddenDup" | "trash";

type Row = {
  id: string;
  user_id?: string;
  title?: string;
  created_at?: string;
  source_date?: string;
  view_count?: number;
  comment_count?: number;
  tags?: any;

  // flags
  is_deleted?: boolean;
  is_hidden?: boolean;
  duplicate_of?: string | null;

  // delete meta (admin trash)
  deleted_at?: string | null;
  deleted_by?: string | null;
  deleted_scope?: "user" | "admin" | null;

  // reason/name 혼재 대비
  delete_reason?: string | null;
  deleted_reason?: string | null;
  delete_note?: string | null;
};

function getStatusKey(r: Row): "active" | "user_trash" | "admin_trash" {
  // deleted_scope가 있으면 그게 우선
  if (r.deleted_scope === "admin") return "admin_trash";
  if (r.deleted_scope === "user") return "user_trash";

  // fallback: is_deleted만 있는 경우(구버전)
  if (r.is_deleted) return "user_trash"; // 또는 admin_trash로 해도 됨. 네 정책대로.
  return "active";
}

function getReasonCode(r: Row): string | null {
  return (r.deleted_reason ?? r.delete_reason ?? null) as any;
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
    if (tab === "trash") return t("admin.data.tabs.trash");
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
      } else if (tab === "trash") {
        setRows(await dbAdminListTrash({ limit: PAGE_SIZE, offset }));
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
        </div>
      </div>

      {/* KPI */}
      <AdminSection title={t("admin.sections.kpi")}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <AdminKpi
            title={t("admin.data.kpi.raw")}
            value={counts.raw}
            foot={t("admin.data.kpiDesc.raw")}
          />
          <AdminKpi
            title={t("admin.data.kpi.public")}
            value={counts.public}
            foot={t("admin.data.kpiDesc.public")}
          />
          <AdminKpi
            title={t("admin.data.kpi.hiddenDup")}
            value={counts.hiddenDuplicates}
            foot={t("admin.data.kpiDesc.hiddenDup")}
          />
        </div>
      </AdminSection>

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
        <Button
          variant={tab === "trash" ? "nav" : "ghost"}
          onClick={() => {
            setPage(0);
            setTab("trash");
          }}
        >
          {t("admin.data.tabs.trash")}
        </Button>
      </div>

      {/* Table */}
      <div
        className="mt-3 overflow-hidden rounded-2xl border"
        style={{
          background: "var(--admin-table-wrap-bg)",
          borderColor: "var(--admin-table-wrap-border)",
        }}
      >
        {err ? <div className="p-4 text-sm text-red-300">{err}</div> : null}

        <table className="w-full text-left text-sm">
          <thead
            className="text-xs"
            style={{
              background: "var(--admin-thead-bg)",
              color: "var(--admin-thead-fg)",
            }}
          >
            <tr>
              <th className="px-3 py-2">{t("admin.data.col.title")}</th>
              <th className="px-3 py-2 w-28">{t("admin.data.col.date")}</th>
              <th className="px-3 py-2 w-24">{t("admin.data.col.views")}</th>
              <th className="px-3 py-2 w-24">{t("admin.data.col.comments")}</th>
              <th className="px-3 py-2">{t("admin.data.col.tags")}</th>

              {tab !== "public" ? (
                <>
                  <th className="px-3 py-2 w-28">
                    {t("admin.data.col.status")}
                  </th>
                  <th className="px-3 py-2 w-40">
                    {t("admin.data.col.reason")}
                  </th>
                  <th className="px-3 py-2 w-32">
                    {t("admin.data.col.deletedAt")}
                  </th>
                </>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && !busy ? (
              <tr>
                <td
                  colSpan={tab !== "public" ? 8 : 5}
                  className="px-3 py-6 text-center"
                  style={{ color: "var(--admin-cell-muted)" }}
                >
                  {t("admin.data.empty")}
                </td>
              </tr>
            ) : null}

            {rows.map((r, idx) => {
              const isStripe = idx % 2 === 1;
              const tags = asTagList(r.tags).slice(0, 6);
              const date = (r.source_date ?? r.created_at ?? "").slice(0, 10);

              const baseBg = isStripe
                ? "var(--admin-row-stripe-bg)"
                : "transparent";

              return (
                <tr
                  key={r.id}
                  className="border-t transition-colors"
                  style={{
                    borderColor: "var(--admin-row-border)",
                    background: baseBg,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--admin-row-hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = baseBg;
                  }}
                >
                  <td className="px-3 py-2">
                    <button
                      className="text-left hover:underline"
                      style={{ color: "var(--admin-cell-fg)" }}
                      onClick={() => nav(`/logs/${r.id}`)}
                      title={r.id}
                    >
                      {r.title || t("common.noTitle")}
                    </button>

                    <div
                      className="mt-1 text-[11px]"
                      style={{ color: "var(--admin-cell-muted)" }}
                    >
                      {r.id}
                    </div>
                  </td>

                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--admin-cell-muted)" }}
                  >
                    {date}
                  </td>

                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--admin-cell-muted)" }}
                  >
                    {r.view_count ?? 0}
                  </td>

                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--admin-cell-muted)" }}
                  >
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
                    <>
                      {/* Status */}
                      <td className="px-3 py-2">
                        {chip(t(`admin.data.status.${getStatusKey(r)}`))}
                      </td>

                      {/* Reason + Note */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <div style={{ color: "var(--admin-cell-fg)" }}>
                            {(() => {
                              const code = getReasonCode(r);
                              if (!code) return "—";
                              return t(`deleteReason.${code}`, {
                                defaultValue: t("deleteReason.unknown"),
                              });
                            })()}
                          </div>

                          {r.delete_note ? (
                            <div
                              className="text-[11px] line-clamp-2"
                              style={{ color: "var(--admin-cell-muted)" }}
                            >
                              {r.delete_note}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Deleted at */}
                      <td
                        className="px-3 py-2"
                        style={{ color: "var(--admin-cell-muted)" }}
                      >
                        {(r.deleted_at ?? "").slice(0, 10) || "—"}
                      </td>
                    </>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pager */}
        <div
          className="flex items-center justify-between gap-2 border-t p-2"
          style={{
            borderColor: "var(--admin-row-border)",
            background: "var(--admin-thead-bg)",
          }}
        >
          <div className="text-xs" style={{ color: "var(--admin-cell-muted)" }}>
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
