import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex-1 rounded-2xl px-4 py-3 text-sm outline-none transition",
        "bg-[var(--field-bg)]",
        "border border-[var(--field-border)]",
        "text-[var(--text-3)] placeholder:text-[var(--field-placeholder)]",
        "focus:border-[var(--field-border-focus)] focus:ring-1 focus:ring-[var(--field-ring)]",
        className,
      )}
      {...props}
    />
  );
}
