import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "nav"
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
    "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none " +
    "active:scale-[0.98]";

  const sizes: Record<Size, string> = {
    sm: "h-8 px-2.5",
    md: "h-9 px-3",
  };

  const variants: Record<Variant, string> = {
    primary:
      "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] " +
      "hover:bg-[var(--btn-primary-hover-bg)] " +
      "border border-[var(--btn-primary-border)]",

    secondary:
      "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] " +
      "hover:bg-[var(--btn-secondary-hover-bg)] " +
      "border border-[var(--btn-secondary-border)]",

    ghost:
      "text-[var(--btn-ghost-fg)] " +
      "hover:text-[var(--btn-ghost-hover-fg)] " +
      "hover:bg-[var(--btn-ghost-hover-bg)]",

    nav:
      "bg-[var(--btn-nav-bg)] text-[var(--btn-nav-fg)] " +
      "border border-[var(--btn-nav-border)] " +
      "hover:bg-[var(--btn-nav-hover-bg)] hover:border-[var(--btn-nav-hover-border)]",

    outline:
      "border border-[var(--btn-outline-border)] " +
      "text-[var(--btn-outline-fg)] " +
      "hover:bg-[var(--btn-outline-hover-bg)]",

    danger:
      "border border-[var(--btn-danger-border)] " +
      "text-[var(--btn-danger-fg)] " +
      "hover:bg-[var(--btn-danger-hover-bg)]",

    icon:
      "h-9 w-9 px-0 " +
      "border border-[var(--border-soft)] " +
      "text-[var(--btn-icon-fg)] " +
      "hover:text-[var(--btn-icon-hover-fg)] " +
      "hover:bg-[var(--btn-icon-hover-bg)]",

    textAction:
      "px-2 py-1 text-sm text-[var(--text-5)] " + "hover:text-[var(--text-3)]",

    soft:
      "rounded-xl px-3 py-2 text-sm " +
      "text-[var(--text-3)] hover:text-[var(--text-2)] " +
      "border border-[var(--border-soft)] " +
      "hover:border-[var(--border-strong)] " +
      "bg-transparent hover:bg-[var(--btn-soft-hover-bg)]",
  };

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
