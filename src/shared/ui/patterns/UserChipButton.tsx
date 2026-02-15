import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  nickname: string;
  avatarUrl?: string;
  rightLabel?: string; // "Logout" 같은 작은 텍스트
  variant?: string;
};

export function UserChipButton({
  nickname,
  avatarUrl,
  rightLabel,
  className,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer inline-flex items-center gap-2",
        "h-9 rounded-xl px-3 transition",
        "border border-[var(--userchip-border)]",
        "bg-[var(--userchip-bg)]",
        "hover:bg-[var(--userchip-hover-bg)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className,
      )}
      {...props}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          className="h-7 w-7 rounded-full border border-[var(--userchip-border)] object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-7 w-7 rounded-full border border-[var(--userchip-border)] bg-[var(--userchip-avatar-bg)]" />
      )}

      <span className="max-w-[120px] truncate text-sm text-[var(--userchip-text)]">
        {nickname}
      </span>

      {rightLabel ? (
        <span className="text-xs text-[var(--userchip-subtext)]">
          {rightLabel}
        </span>
      ) : null}
    </button>
  );
}
