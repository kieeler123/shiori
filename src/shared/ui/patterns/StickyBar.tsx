// src/shared/ui/patterns/StickyBar.tsx
import type { HTMLAttributes } from "react";

export function StickyBar({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <header className="header-shell" {...props} />;
}
