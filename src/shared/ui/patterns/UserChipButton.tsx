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
  variant,
  className,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer",
        "inline-flex items-center gap-2",
        "h-9 rounded-xl px-3",
        "border border-[var(--border-soft)]",
        "bg-transparent hover:bg-[rgba(17,24,39,0.55)]",
        "transition",
        className,
      )}
      {...props}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          className="h-7 w-7 rounded-full border border-[var(--border-soft)] object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-7 w-7 rounded-full border border-[var(--border-soft)] bg-[rgba(17,24,39,0.4)]" />
      )}

      <span className="max-w-[120px] truncate text-sm text-[var(--text-3)]">
        {nickname}
      </span>

      {rightLabel ? (
        <span className="text-xs text-[var(--text-6)]">{rightLabel}</span>
      ) : null}
    </button>
  );
}
