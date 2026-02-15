// shared/ui/primitives/Input.tsx
import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-xl px-3 py-2 text-sm outline-none transition",
        "bg-[var(--field-bg)] border border-[color:var(--field-border)]",
        "text-[var(--text-2)] placeholder:text-[color:var(--field-placeholder)]",
        "focus:ring-2 focus:ring-[var(--ring)]",
        "focus:border-[color:var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
