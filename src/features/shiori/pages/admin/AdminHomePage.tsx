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
} from "recharts";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { cn } from "@/shared/ui/utils/cn";
import { Button } from "@/shared/ui/primitives/Button";

import {
  dbAdminLast7Days,
  dbAdminOverview,
  dbAdminTopTags,
} from "@/features/shiori/repo/adminRepo";

function Card({
  title,
  desc,
  children,
  className,
  right,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-[var(--text-2)]">
            {title}
          </div>
          {desc ? (
            <div className="mt-1 text-xs text-[var(--text-5)]">{desc}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function AdminHomePage() {
  const nav = useNavigate();
  const { t } = useI18n();

  const [logs, setLogs] = useState({
    total: 0,
    public: 0,
    private: 0,
    trash: 0,
  });

  const [support, _setSupport] = useState({ open: 0, total: 0 });
  const [users, _setUsers] = useState({ total: 0 });

  const [last7, setLast7] = useState<{ day: string; value: number }[]>([]);
  const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pieData = useMemo(
    () => [
      { name: t("admin.pie.public"), value: logs.public },
      { name: t("admin.pie.private"), value: logs.private },
      { name: t("admin.pie.trash"), value: logs.trash },
    ],
    [logs.public, logs.private, logs.trash, t],
  );

  const publicRatio = Math.round((logs.public / Math.max(1, logs.total)) * 100);

  async function refresh() {
    setErr(null);
    setBusy(true);
    try {
      const ov = await dbAdminOverview();
      setLogs(ov.logs);

      setLast7(await dbAdminLast7Days());
      setTopTags(await dbAdminTopTags(10));
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-4">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-[var(--text-2)]">
            {t("admin.title")}
          </div>
          <div className="mt-1 text-sm text-[var(--text-5)]">
            {t("admin.subtitle")}
          </div>
          {err ? <div className="mt-2 text-xs text-red-300">{err}</div> : null}
        </div>

        {/* Actions: 버튼은 여기로 모으는 게 톤이 제일 맞음 */}
        <div className="flex items-center gap-2">
          <Button variant="nav" onClick={() => nav("/admin/data")}>
            {t("admin.actions.data")}
          </Button>

          {/* /admin/date 만들 거면 살리고, 아니면 삭제 */}
          <Button variant="outline" onClick={() => nav("/admin/date")}>
            {t("admin.actions.date")}
          </Button>

          <Button variant="ghost" onClick={refresh} disabled={busy}>
            {busy ? t("common.loading") : t("common.refresh")}
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card title={t("admin.kpi.logsTotal")} desc={t("admin.kpiDesc.logs")}>
          <div className="text-2xl font-semibold text-[var(--text-2)]">
            {logs.total}
          </div>
          <div className="mt-1 text-xs text-[var(--text-5)]">
            {t("admin.kpi.logsPublic")} {logs.public} ·{" "}
            {t("admin.kpi.logsPrivate")} {logs.private}
          </div>
        </Card>

        <Card title={t("admin.kpi.trash")} desc={t("admin.kpiDesc.trash")}>
          <div className="text-2xl font-semibold text-[var(--text-2)]">
            {logs.trash}
          </div>
          <div className="mt-1 text-xs text-[var(--text-5)]">
            {t("admin.note.trashHint")}
          </div>
        </Card>

        <Card
          title={t("admin.kpi.supportOpen")}
          desc={t("admin.kpiDesc.support")}
        >
          <div className="text-2xl font-semibold text-[var(--text-2)]">
            {support.open}
          </div>
          <div className="mt-1 text-xs text-[var(--text-5)]">
            {t("admin.kpi.supportTotal")} {support.total}
          </div>
        </Card>

        <Card title={t("admin.kpi.users")} desc={t("admin.kpiDesc.users")}>
          <div className="text-2xl font-semibold text-[var(--text-2)]">
            {users.total}
          </div>
          <div className="mt-1 text-xs text-[var(--text-5)]">
            {t("admin.note.usersHint")}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card
          title={t("admin.chart.contentStatus")}
          desc={t("admin.chartDesc.contentStatus", { n: publicRatio })}
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={2}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-[var(--text-5)]">
            {t("admin.note.contentStatusHint")}
          </div>
        </Card>

        <Card
          title={t("admin.chart.last7Days")}
          desc={t("admin.chartDesc.last7Days")}
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7}>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-[var(--text-5)]">
            {t("admin.note.last7DaysHint")}
          </div>
        </Card>
      </div>

      <div className="mt-3">
        <Card
          title={t("admin.chart.topTags")}
          desc={t("admin.chartDesc.topTags")}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTags} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid
                  horizontal={false}
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="tag"
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-xs text-[var(--text-5)]">
            {t("admin.note.topTagsHint")}
          </div>
        </Card>
      </div>
    </div>
  );
}
