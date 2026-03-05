// src/features/shiori/admin/ui/AdminKpi.tsx
import { AdminCard } from "./AdminCard";

export function AdminKpi({
  title,
  value,
  desc,
  foot,
}: {
  title: React.ReactNode;
  value: React.ReactNode;
  desc?: React.ReactNode;
  foot?: React.ReactNode;
}) {
  return (
    <AdminCard title={title} desc={desc}>
      <div className="text-2xl font-semibold text-[var(--text-2)]">{value}</div>
      {foot ? (
        <div className="mt-1 text-xs text-[var(--text-5)]">{foot}</div>
      ) : null}
    </AdminCard>
  );
}
