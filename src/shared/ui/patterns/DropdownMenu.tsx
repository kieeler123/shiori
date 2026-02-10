import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export function DropdownPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20",
        "border-b border-[var(--border-soft)]",
        "bg-[color:rgba(15,23,42,0.72)] backdrop-blur-md", // 애플톤 글래스 느낌
        "shadow-[0_8px_30px_rgba(0,0,0,0.25)]",
        "mx-auto max-w-3xl px-6 py-6",
        className,
      )}
      {...props}
    />
  );
}
