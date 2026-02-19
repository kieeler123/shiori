import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
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
});
