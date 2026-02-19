import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export const DropdownMenuPanel = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[14rem] overflow-hidden rounded-2xl",
        "border border-[color:var(--menu-border)]",
        "bg-[var(--menu-bg)]",
        "shadow-[var(--menu-shadow)]",
        "backdrop-blur-[var(--menu-blur)]",
        // 중복 선언 정리(둘 중 하나만 남겨도 됨)
        "shadow-lg",
        "backdrop-blur-[10px]",
        className,
      )}
      {...props}
    />
  );
});

DropdownMenuPanel.displayName = "DropdownMenuPanel";
