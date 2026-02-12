import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function CardButton({ className, ...props }: Props) {
  return (
    <button
      className={cn(
        "w-full cursor-pointer rounded-2xl p-5 text-left",
        "border border-zinc-700",
        "[background:var(--bg-elev-1)]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.35)]",
        "transition-all duration-200 hover:-translate-y-[1px]",
        "hover:bg-[var(--bg-elev-2)] hover:border-zinc-500",
        "focus:outline-none focus:ring-2 focus:ring-[color:rgba(59,130,2var(--border-strong)] text-zinc-200",

        className,
      )}
      {...props}
    />
  );
}
