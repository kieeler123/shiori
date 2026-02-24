import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export const DropdownMenuPanel = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[14rem] rounded-2xl",
        "border border-[color:var(--menu-border)]",
        "bg-[var(--menu-bg)]",
        "shadow-[var(--menu-shadow)]",
        "backdrop-blur-[var(--menu-blur)]",
        className,
      )}
      {...props}
    />
  );
});

DropdownMenuPanel.displayName = "DropdownMenuPanel";
