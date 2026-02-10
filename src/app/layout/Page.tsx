import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
};

export function Page({
  title,
  description,
  left,
  right,
  className,
  children,
  ...props
}: Props) {
  return (
    <div className={cn("min-h-[calc(100vh-72px)]", className)} {...props}>
      <div className="mx-auto max-w-3xl px-6 py-6">
        {(title || right || description) && (
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title && (
                <h1 className="text-lg font-semibold text-[var(--text-main)]">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-[var(--text-sub)]">
                  {description}
                </p>
              )}
            </div>
            {right && <div className="shrink-0">{right}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
