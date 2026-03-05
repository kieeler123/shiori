// src/shared/ui/patterns/StickyBar.tsx
import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function StickyBar({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <header className={cn("header-shell", className)} {...props} />;
}
