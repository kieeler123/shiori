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
  const base = cn(
    "select-none inline-flex items-center justify-center gap-1",
    "transition-all duration-150",
    "cursor-pointer",
    "focus:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
    "focus-visible:ring-offset-0",
    // ✅ 클릭 시 파란 outline 방지 + 키보드 탭만 표시 유지
  );

  const sizes: Record<Size, string> = {
    sm: "h-8 px-2.5",
    md: "h-9 px-3",
  };

  // ✅ border 있는 버튼들은 포커스 시 border도 올려주면 보기 좋음
  const focusBorder = "focus-visible:border-[var(--border-strong)]";

  const variants: Record<Variant, string> = {
    primary:
      "rounded-xl " +
      "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] " +
      "hover:bg-[var(--btn-primary-hover-bg)] " +
      "border border-[var(--btn-primary-border)] " +
      focusBorder,

    secondary:
      "rounded-xl " +
      "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] " +
      "hover:bg-[var(--btn-secondary-hover-bg)] " +
      "border border-[var(--btn-secondary-border)] " +
      focusBorder,

    ghost:
      "rounded-xl " +
      "text-[var(--btn-ghost-fg)] " +
      "hover:text-[var(--btn-ghost-hover-fg)] " +
      "hover:bg-[var(--btn-ghost-hover-bg)]",

    nav:
      "rounded-xl " +
      "bg-[var(--btn-nav-bg)] text-[var(--btn-nav-fg)] " +
      "border border-[var(--btn-nav-border)] " +
      "hover:bg-[var(--btn-nav-hover-bg)] hover:border-[var(--btn-nav-hover-border)] " +
      focusBorder,

    outline:
      "rounded-xl " +
      "border border-[var(--btn-outline-border)] " +
      "text-[var(--btn-outline-fg)] " +
      "hover:bg-[var(--btn-outline-hover-bg)] " +
      focusBorder,

    danger:
      "rounded-xl " +
      "border border-[var(--btn-danger-border)] " +
      "text-[var(--btn-danger-fg)] " +
      "hover:bg-[var(--btn-danger-hover-bg)] " +
      focusBorder,

    icon:
      "h-9 w-9 px-0 rounded-xl inline-flex items-center justify-center " +
      "border border-[var(--border-soft)] " +
      "text-[var(--btn-icon-fg)] " +
      "hover:text-[var(--btn-icon-hover-fg)] " +
      "hover:bg-[var(--btn-icon-hover-bg)] " +
      "transition-colors duration-150 " +
      focusBorder,

    soft:
      "rounded-xl px-3 py-2 text-sm " +
      "text-[var(--text-3)] hover:text-[var(--text-2)] " +
      "border border-[var(--border-soft)] " +
      "hover:border-[var(--border-strong)] " +
      "bg-transparent hover:bg-[var(--btn-soft-hover-bg)] " +
      "transition-colors duration-150 " +
      focusBorder,
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
