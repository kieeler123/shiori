// shared/ui/primitives/Input.tsx
import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-xl px-3 py-2 text-sm",
        "border border-[var(--border-soft)] bg-[var(--bg-elev-1)]",
        "text-[var(--text-main)] placeholder:text-[var(--text-sub)]/70",
        "outline-none",
        "focus:ring-2 focus:ring-[color:rgba(59,130,246,0.35)]",
        "focus:border-[color:rgba(59,130,246,0.35)] text-zinc-200",
        className,
      )}
      {...props}
    />
  );
}
