import * as React from "react";
import { cn } from "@/shared/ui/utils/cn";

export type TagChipVariant = "filter" | "display";
export type TagChipSize = "sm" | "md";

type Props = {
  /** 기본 사용: tag만 넘기면 됨 */
  tag?: string;

  /** 옵션: "(3)" 같은 카운트 */
  count?: number;

  /** 활성 상태(필터 선택 등) */
  active?: boolean;

  /** 클릭 시 tag를 넘겨주고 싶으면 여기 사용 */
  onClick?: (tag: string) => void;

  /** UI 톤: 필터용 vs 표시용 */
  variant?: TagChipVariant;

  /** 크기 */
  size?: TagChipSize;

  /** 툴팁 */
  titlePrefix?: string;

  /** 필요하면 커스텀 렌더도 가능 */
  children?: React.ReactNode;

  className?: string;
};

export default function TagChip({
  tag,
  count,
  active = false,
  onClick,
  variant = "filter",
  size = "sm",
  children,
  className,
}: Props) {
  const clickable = Boolean(onClick);

  const base = cn(
    "select-none inline-flex items-center gap-1 rounded-full border",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
    clickable ? "cursor-pointer" : "cursor-default",
  );

  const sizes: Record<TagChipSize, string> = {
    sm: "px-2 py-[2px] text-[11px]",
    md: "px-3 py-1 text-xs",
  };

  // ✅ 은은한 다크 톤 (A 70% + B 30%)
  const styles = {
    filter: {
      idle: cn(
        "border border-[var(--border-soft)] text-[var(--text-5)] bg-[var(--bg-elev-1)]",
        clickable &&
          "hover:bg-[var(--bg-elev-2)] hover:text-[var(--text-2)] hover:border-[var(--border-strong)]",
      ),
      active: cn(
        "border border-[var(--border-strong)] bg-[var(--bg-elev-2)] text-[var(--text-2)]",
        clickable &&
          "hover:bg-[var(--surface-3)] hover:border-[var(--border-strong)]",
      ),
    },
    display: {
      idle: "border border-[var(--border-soft)] text-[var(--text-5)] bg-[var(--bg-elev-1)]",
      active:
        "border border-[var(--border-strong)] text-[var(--text-3)] bg-[var(--bg-elev-2)]",
    },
  } as const;

  const tone = active ? styles[variant].active : styles[variant].idle;

  const content = children ?? (
    <>
      <span className="opacity-80">#</span>
      <span>{tag}</span>
      {typeof count === "number" ? (
        <span className="opacity-60">({count})</span>
      ) : null}
    </>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(base, sizes[size], tone, className)}
      onClick={() => {
        if (!tag || !onClick) return;
        onClick(tag);
      }}
      onKeyDown={(e) => {
        if (!tag || !onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(tag);
        }
      }}
    >
      {content}
    </div>
  );
}
