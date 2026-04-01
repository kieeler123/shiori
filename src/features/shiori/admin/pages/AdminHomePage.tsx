// src/features/shiori/pages/admin/AdminHomePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Sector,
} from "recharts";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { Button } from "@/shared/ui/primitives/Button";

import {
  dbAdminLast7Days,
  dbAdminOverview,
  dbAdminTopTags,
} from "../repo/adminRepo";

import { AdminSection } from "@/features/shiori/admin/ui/AdminSection";
import { AdminKpi } from "@/features/shiori/admin/ui/AdminKpi";
import { AdminCard } from "@/features/shiori/admin/ui/AdminCard";

export default function AdminHomePage() {
  const nav = useNavigate();
  const { t } = useI18n();

  const [logs, setLogs] = useState({
    total: 0,
    public: 0,
    private: 0,
    trash: 0,
  });

  const [last7, setLast7] = useState<{ day: string; value: number }[]>([]);
  const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);

  const [_busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const data = useMemo(
    () => [
      { name: t("admin.pie.public"), value: logs.public },
      { name: t("admin.pie.private"), value: logs.private },
      { name: t("admin.pie.trash"), value: logs.trash },
    ],
    [logs.public, logs.private, logs.trash, t],
  );

  const publicRatio = Math.round((logs.public / Math.max(1, logs.total)) * 100);

  const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

  const [_activePie, setActivePie] = useState<number | null>(null);

  async function refresh() {
    setErr(null);
    setBusy(true);
    try {
      const ov = await dbAdminOverview();
      setLogs(ov.logs);

      const [l7, tags] = await Promise.all([
        dbAdminLast7Days(),
        dbAdminTopTags(10),
      ]);
      setLast7(l7);
      setTopTags(tags);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  function cssVar(name: string, fallback: string) {
    if (typeof window === "undefined") return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v || fallback).trim();
  }

  function AdminTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-2xl border p-4 transition-colors"
        style={{
          background: "var(--admin-panel-bg)",
          borderColor: "var(--admin-panel-border)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--admin-panel-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--admin-panel-bg)")
        }
      >
        {label ? (
          <div className="mb-1 text-[var(--text-5)]">{label}</div>
        ) : null}
        {payload.map((p: any) => (
          <div
            key={p.dataKey}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-[var(--text-4)]">{p.name ?? p.dataKey}</span>
            <span className="font-semibold text-[var(--text-2)]">
              {p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  function renderActivePieShape(props: any) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;

    return (
      <>
        {/* 바깥 링(은은한 강조) */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 2}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill="var(--chart-pie-ring)"
          stroke="none"
        />

        {/* 실제 조각(살짝 커짐 + stroke) */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6} // ✅ 살짝 커짐
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill} // ✅ 기본 slice 색 유지
          stroke="var(--chart-pie-stroke)"
          strokeWidth={2}
        />
      </>
    );
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-4">
      {/* Page Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[var(--text-2)]">
            {t("admin.title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-5)]">
            {t("admin.subtitle")}
          </p>
          {err ? <div className="mt-2 text-xs text-red-300">{err}</div> : null}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="nav" onClick={() => nav("/admin/data")}>
            {t("admin.actions.data")}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="nav" onClick={() => nav("/admin/error-logs")}>
            error log
          </Button>
        </div>
      </div>

      {/* KPI */}
      <AdminSection title={t("admin.sections.kpi")}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <AdminKpi
            title={t("admin.dashboard.kpi.logsTotal")}
            desc={t("admin.dashboard.kpiDesc.logs")}
            value={logs.total}
            foot={
              <>
                {t("admin.dashboard.kpi.logsPublic")} {logs.public} ·{" "}
                {t("admin.dashboard.kpi.logsPrivate")} {logs.private}
              </>
            }
          />
          <AdminKpi
            title={t("admin.dashboard.kpi.trash")}
            desc={t("admin.dashboard.kpiDesc.trash")}
            value={logs.trash}
            foot={t("admin.dashboard.note.trashHint")}
          />
          <AdminKpi
            title={t("admin.dashboard.kpi.publicRatio")}
            desc={t("admin.kpiDesc.publicRatio")}
            value={`${publicRatio}%`}
            foot={t("admin.dashboard.note.publicRatioHint")}
          />
          <AdminKpi
            title={t("admin.dashboard.kpi.tagsTop")}
            desc={t("admin.dashboard.kpiDesc.tagsTop")}
            value={topTags[0]?.tag ? `#${topTags[0].tag}` : "—"}
            foot={
              topTags[0]?.count != null
                ? `${t("admin.dashboard.kpi.tagsCount")} ${topTags[0].count}`
                : t("admin.dashboard.note.tagsEmpty")
            }
          />
        </div>
      </AdminSection>

      {/* Charts */}
      <AdminSection
        title={t("admin.sections.charts")}
        desc={t("admin.sectionsDesc.charts")}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <AdminCard
            title={t("admin.chart.contentStatus")}
            desc={t("admin.chartDesc.contentStatus", { n: publicRatio })}
          >
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={<AdminTooltip />}
                    cursor={{
                      fill: "var(--chart-hover-bg)",
                      stroke: "var(--chart-hover-line)",
                      strokeWidth: 1,
                    }}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    activeShape={renderActivePieShape}
                    onMouseEnter={(_, idx) => setActivePie(idx)}
                    onMouseLeave={() => setActivePie(null)}
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={2}
                    isAnimationActive
                    animationBegin={0}
                    animationDuration={600}
                    animationEasing="ease-out"
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PALETTE[i % PALETTE.length]}
                        stroke="var(--chart-pie-stroke)" // ✅ 기본 테두리
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-[var(--text-5)]">
              {t("admin.dashboard.note.contentStatusHint")}
            </div>
          </AdminCard>

          <AdminCard
            title={t("admin.chart.last7Days")}
            desc={t("admin.chartDesc.last7Days")}
          >
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7}>
                  <CartesianGrid stroke="var(--chart-grid)" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={28} />
                  <Tooltip
                    content={<AdminTooltip />}
                    cursor={{ fill: "var(--chart-hover-bg)" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--chart-1)"
                    activeBar={{
                      fill: "var(--chart-2)",
                      opacity: 0.75,
                      strokeWidth: 2,
                    }}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-[var(--text-5)]">
              {t("admin.dashboard.note.last7DaysHint")}
            </div>
          </AdminCard>
        </div>
      </AdminSection>

      {/* Tags */}
      <AdminSection
        title={t("admin.sections.tags")}
        desc={t("admin.chartDesc.topTags")}
      >
        <AdminCard
          title={t("admin.chart.topTags")}
          desc={t("admin.chartDesc.topTags")}
          right={
            <Button variant="ghost" onClick={() => nav("/admin/data")}>
              {t("admin.actions.openData")}
            </Button>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTags} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid
                  vertical={false}
                  stroke={cssVar("var(--chart-grid)", "rgba(255,255,255,0.06)")}
                />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="tag"
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--chart-tooltip-bg)",
                    border: "1px solid var(--chart-tooltip-border)",
                    borderRadius: 12,
                  }}
                  labelStyle={{ color: "var(--text-3)" }}
                  itemStyle={{ color: "var(--text-2)" }}
                  cursor={{
                    fill: "var(--chart-hover-bg)",
                    stroke: "var(--chart-hover-line)",
                    strokeWidth: 1,
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--chart-1)"
                  activeBar={{
                    fill: "var(--chart-2)",
                    opacity: 0.85,
                    stroke: "var(--chart-hover-line)",
                    strokeWidth: 1,
                  }}
                  radius={[0, 10, 10, 0]}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-xs text-[var(--text-5)]">
            {t("admin.dashboard.note.topTagsHint")}
          </div>
        </AdminCard>
      </AdminSection>
    </div>
  );
}
