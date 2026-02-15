import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export function DropdownMenuPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute z-50 min-w-[14rem] overflow-hidden rounded-2xl",
        "border border-[color:var(--menu-border)]",
        "bg-[var(--menu-bg)]",
        "shadow-[var(--menu-shadow)]",
        "backdrop-blur-[var(--menu-blur)]",
        "shadow-lg",
        "border-[var(--menu-border)]",
        "backdrop-blur-[10px]",
        className,
      )}
      {...props}
    />
  );
}
