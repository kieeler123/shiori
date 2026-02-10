import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  tone?: 1 | 2;
};

export function Surface({ tone = 1, className, ...props }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-soft)]",
        tone === 1
          ? "bg-[var(--bg-elev-1)]"
          : "bg-[var(--bg-elev-2)]  text-zinc-200",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.35)]",
        className,
      )}
      {...props}
    />
  );
}
