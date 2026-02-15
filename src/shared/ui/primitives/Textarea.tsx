// shared/ui/primitives/Textarea.tsx
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl px-3 py-2 text-sm outline-none transition",
        "bg-[var(--field-bg)] border border-[color:var(--field-border)]",
        "text-[color:var(--text-2)] placeholder:text-[color:var(--field-placeholder)]",
        "focus:ring-2 focus:ring-[color:var(--ring)]",
        "focus:border-[color:var(--field-focus-border)]",
        className,
      )}
      {...props}
    />
  );
}
