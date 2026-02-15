import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Tone = "panel" | "soft";

export function SurfaceCard({
  tone = "soft",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    panel: "bg-[var(--bg-elev-1)] border border-[color:var(--border-strong)]",
    soft: "bg-[var(--bg-elev-2)] border border-[color:var(--border-soft)]",
  };

  return (
    <div className={cn("rounded-2xl p-4", tones[tone], className)} {...props} />
  );
}
