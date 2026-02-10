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
  titlePrefix = variant === "filter" ? "태그 필터" : "태그",
  children,
  className,
}: Props) {
  const clickable = Boolean(onClick);

  const base = cn(
    "select-none inline-flex items-center gap-1 rounded-full border",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-zinc-700/60",
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
        "border-zinc-800/70 text-zinc-400 bg-zinc-900/40",
        clickable &&
          "hover:bg-zinc-900/70 hover:text-zinc-100 hover:border-zinc-700/70",
      ),
      active: cn(
        "border-zinc-700/80 bg-zinc-900/85 text-zinc-100",
        clickable && "hover:bg-zinc-900 hover:border-zinc-600/80",
      ),
    },
    display: {
      idle: "border-zinc-800/70 text-zinc-400 bg-zinc-900/30",
      active: "border-zinc-700/80 text-zinc-200 bg-zinc-900/60",
    },
  } as const;

  const tone = active ? styles[variant].active : styles[variant].idle;

  const title = tag
    ? `${titlePrefix}: #${tag}${typeof count === "number" ? ` (${count})` : ""}`
    : undefined;

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
    >
      {content}
    </div>
  );
}
