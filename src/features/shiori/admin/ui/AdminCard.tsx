// src/features/shiori/admin/ui/AdminCard.tsx
import { cn } from "@/shared/ui/utils/cn";

export function AdminCard({
  title,
  desc,
  right,
  children,
  className,
}: {
  title: React.ReactNode;
  desc?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-bg)]/60 p-4",
        "shadow-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text-2)]">
            {title}
          </div>
          {desc ? (
            <div className="mt-1 text-xs text-[var(--text-5)]">{desc}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </header>

      <div className="mt-3">{children}</div>
    </section>
  );
}
