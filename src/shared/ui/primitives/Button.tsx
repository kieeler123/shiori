import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "icon"
  | "textAction"
  | "soft";
export type Size = "sm" | "md";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit" | "reset";
};

export function Button({
  variant = "secondary",
  size = "sm",
  className = "",
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "cursor-pointer inline-flex items-center justify-center gap-2 " +
    "select-none whitespace-nowrap " +
    "rounded-xl text-sm font-medium " +
    "transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-zinc-700/60 " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none " +
    "active:scale-[0.98]";

  const sizes: Record<Size, string> = {
    sm: "h-8 px-2.5",
    md: "h-9 px-3",
  };

  const variants: Record<Variant, string> = {
    /**
     * Primary CTA: quiet but clear
     */
    primary:
      "bg-zinc-200 text-black " +
      "hover:bg-zinc-100 " +
      "border border-zinc-200/80",

    /**
     * Secondary: subtle filled surface
     */
    secondary:
      "bg-zinc-900/60 text-zinc-100 " +
      "hover:bg-zinc-900/80 " +
      "border border-zinc-800/70",

    /**
     * Ghost: text button
     */
    ghost: "text-zinc-300 hover:text-zinc-100 " + "hover:bg-zinc-900/60",

    /**
     * Outline: quiet border
     */
    outline:
      "border border-zinc-800/70 text-zinc-200 " +
      "hover:bg-zinc-900/60 hover:border-zinc-700/70",

    /**
     * Danger: delete / destructive
     */
    danger:
      "border border-red-500/40 text-red-200 " +
      "hover:bg-red-500/10 hover:border-red-500/60",

    /**
     * Icon: square button for hamburger / icons
     */
    icon:
      "h-9 w-9 px-0 " +
      "border border-zinc-800/70 text-zinc-200 " +
      "hover:bg-zinc-900/60 hover:text-zinc-100",
    textAction:
      "cursor-pointer px-2 py-1 text-sm text-[var(--muted)] hover:text-[var(--fg)] transition",
    soft:
      "cursor-pointer rounded-xl px-3 py-2 text-sm transition " +
      "text-zinc-200 hover:text-[var(--text-main)] " +
      "border border-[var(--border-soft)] hover:border-[var(--border-strong)] " +
      "bg-transparent hover:bg-[var(--bg-elev-1)] " +
      "focus:outline-none focus:ring-2 focus:ring-[color:rgba(59,130,246,0.35)]",
  };

  // icon variant ignores size padding by design
  const sizeClass = variant === "icon" ? "" : sizes[size];

  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizeClass, className)}
      disabled={disabled}
      {...props}
    />
  );
}
