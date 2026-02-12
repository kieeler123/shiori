import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export function PageContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-3xl px-6 py-8 space-y-4 t2",
        className,
      )}
      {...props}
    />
  );
}
