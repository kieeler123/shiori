import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type LoadingTextProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  size?: "sm" | "md";
  align?: "left" | "center";
};

export function LoadingText({
  label = "불러오는 중…",
  size = "md",
  align = "left",
  className,
  ...props
}: LoadingTextProps) {
  return (
    <div
      className={cn(
        align === "center" ? "text-center" : "text-left",
        size === "sm" ? "text-xs" : "text-sm",
        "text-[var(--text-sub)]",
        className,
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      {label}
    </div>
  );
}
