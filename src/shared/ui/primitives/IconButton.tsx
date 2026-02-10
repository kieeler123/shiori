import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({ className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={[
        "h-9 w-9 rounded-xl inline-flex items-center justify-center",
        "text-[var(--muted)] hover:text-[var(--fg)]",
        "hover:bg-[var(--hover)] active:bg-[var(--active)]",
        "transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
        className,
      ].join(" ")}
    />
  );
}
