import { useEffect, useRef } from "react";
import { Input } from "@/shared/ui/primitives/Input";
import { cn } from "@/shared/ui/utils/cn";
import { useShioriSearch } from "@/features/shiori/components/search/SearchContext";

type Props = {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  showClear?: boolean; // 필요하면 끄기
};

export function HeaderSearchBar({
  className,
  placeholder = "검색: 제목 / 내용 / 태그",
  autoFocus = false,
  showClear = true,
}: Props) {
  const { query, setQuery, clearQuery } = useShioriSearch();
  const hasQuery = query.trim().length > 0;

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!autoFocus) return;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [autoFocus]);

  return (
    <div className={cn("relative min-w-0", className)}>
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") clearQuery();
        }}
        placeholder={placeholder}
        className={cn(showClear ? "pr-10" : "")}
      />

      {showClear && hasQuery ? (
        <button
          type="button"
          onClick={() => {
            clearQuery();
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          aria-label="clear"
          title="Clear"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "h-7 w-7 rounded-lg",
            "text-[var(--text-4)]",
            "hover:bg-[var(--btn-icon-hover-bg)] hover:text-[var(--text-2)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          )}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
