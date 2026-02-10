import type { ReactNode } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, hint, error, children, className }: Props) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-[var(--text-main)]">
          {label}
        </label>
        {hint && <span className="text-xs text-[var(--text-sub)]">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
