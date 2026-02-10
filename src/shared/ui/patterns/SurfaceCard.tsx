import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Tone = "panel" | "soft";

export function SurfaceCard({
  tone = "soft",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    panel:
      "bg-[var(--bg-elev-1)]/40 border border-[var(--var(--border-strong))]",
    soft: "bg-[rgba(17,24,39,0.40)] border border-[var(--border-soft)]",
  };

  return (
    <div className={cn("rounded-2xl p-4", tones[tone], className)} {...props} />
  );
}
