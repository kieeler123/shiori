// src/app/layout/PageContainer.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export function PageHeaderRow({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="container-main">
      {/* header-row가 핵심 */}
      <div
        className={cn(
          "header-row",
          "flex items-center justify-between gap-3",
          className,
        )}
        {...props}
      />
    </div>
  );
}
