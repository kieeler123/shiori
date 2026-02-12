import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

export function ListItemButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer",
        "w-full text-left rounded-2xl p-4",
        "border border-[var(--item-border)]",
        "bg-[var(--item-bg)]",
        "transition duration-200",
        "hover:bg-[var(--item-hover-bg)] hover:border-[var(--item-hover-border)]",
        "hover:shadow-[var(--item-hover-shadow)]",
        "active:scale-[var(--item-active-scale)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
