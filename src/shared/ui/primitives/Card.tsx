import * as React from "react";
import { cn } from "@/shared/ui/utils/cn";

type CardProps = {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: "panel" | "card";
};

export function Card({ variant = "card", className, ...props }: CardProps) {
  const base =
    "rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)]";

  const styles = {
    panel: cn(base, "p-4"),
    card: cn(
      base,
      "p-5 text-left",
      "shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.35)]",
      "transition-all duration-200 hover:-translate-y-[1px]",
      "hover:bg-[var(--bg-elev-2)] hover:border-[var(--border-strong)]",
      "focus:outline-none focus:ring-2 focus:ring-[color:rgba(59,130,246,0.35)]",
    ),
  } as const;

  return <div className={cn(styles[variant], className)} {...props} />;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-medium text-zinc-100 truncate">{children}</h3>;
}

export function CardMeta({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-zinc-500">{children}</span>;
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm text-zinc-400">{children}</p>;
}
