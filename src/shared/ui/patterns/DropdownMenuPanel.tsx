import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export function DropdownMenuPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // ✅ 기준: relative 부모 내부에서 absolute로 뜨는 패널
        "absolute z-50 w-64",
        "rounded-2xl border border-[var(--border-soft)]",
        "bg-[rgba(17,24,39,0.85)] backdrop-blur",
        "shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
        "p-2",
        className,
      )}
      {...props}
    />
  );
}
