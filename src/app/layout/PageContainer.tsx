// src/app/layout/PageContainer.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export function PageContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="container-main">
      <div
        className={cn("flex items-center justify-between gap-3", className)}
        {...props}
      ></div>
    </div>
  );
}
