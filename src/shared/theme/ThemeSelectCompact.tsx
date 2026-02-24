// src/shared/ui/patterns/ThemeSelectCompact.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/ui/utils/cn";
import type {
  ThemeName,
  ThemePreset,
  ThemeTokens,
} from "@/shared/theme/theme.types";
import { DropdownPortal } from "@/shared/ui/patterns/DropdownPortal";
import { DropdownMenuPanel } from "@/shared/ui/patterns/DropdownMenuPanel";

// ✅ 토큰에서 대표색 1개 고르기
function getAccentColor(tokens: ThemeTokens) {
  const v =
    tokens["--accent"] ||
    tokens["--accent-1"] ||
    tokens["--ring"] ||
    tokens["--btn-primary-bg"] ||
    tokens["--text-1"];

  if (!v) return "#888";
  // var(--xxx) 같은 값이면 실제 색 추출 불가 => 무시하고 fallback
  if (typeof v === "string" && v.trim().startsWith("var(")) return "#888";
  return String(v);
}

type Mode = "auto" | "dot" | "label";

type Props = {
  value: ThemeName;
  presets: ThemePreset[];
  onChange: (next: ThemeName) => void;
  className?: string;
  mode?: Mode;
  panelWidth?: number;
};

export default function ThemeSelectCompact({
  value,
  presets,
  onChange,
  className,
  mode = "auto",
  panelWidth = 260,
}: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const current = useMemo(() => {
    const found = presets.find((p) => p.name === value);
    return found ?? presets[0];
  }, [presets, value]);

  const currentAccent = useMemo(
    () => getAccentColor(current.tokens),
    [current.tokens],
  );

  // ✅ 버튼 rect 최신화
  function syncAnchor() {
    const r = btnRef.current?.getBoundingClientRect() ?? null;
    setAnchorRect(r);
  }

  // open 시 rect 잡기
  useEffect(() => {
    if (!open) return;
    syncAnchor();
  }, [open]);

  // 바깥 클릭 닫기 + ESC 닫기
  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // mode에 따른 라벨 표시 규칙
  // - auto: sm 이상에서만 라벨
  // - dot : 라벨 숨김
  // - label: 항상 라벨
  const labelClass =
    mode === "dot"
      ? "hidden"
      : mode === "label"
        ? "inline text-sm t5"
        : "hidden sm:inline text-sm t5";

  // 버튼 크기: 모바일(아이콘형) / 데스크탑(라벨형) 분리
  // auto 모드에서 sm 이상은 라벨이 나오므로 버튼 폭도 넓혀줌
  const btnSizeClass =
    mode === "dot"
      ? "h-9 w-9"
      : mode === "label"
        ? "h-9 px-3"
        : "h-9 w-9 sm:w-auto sm:px-3";

  return (
    <div className={cn("relative", className)}>
      {/* Trigger */}
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="테마 변경"
        title="테마 변경"
        onClick={() => {
          setOpen((v) => !v);
          // 열리는 순간 rect 갱신
          requestAnimationFrame(syncAnchor);
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          btnSizeClass,
          "rounded-xl border border-[var(--border-soft)]",
          "bg-[var(--bg-elev-1)] hover:bg-[var(--bg-elev-2)]",
          "transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        )}
      >
        <span
          className="h-3.5 w-3.5 rounded-full border border-[var(--border-soft)]"
          style={{ backgroundColor: currentAccent }}
          aria-hidden="true"
        />
        <span className={labelClass}>{current.label}</span>
        {/* caret는 데스크탑에서만 */}
        <span
          className={cn(
            mode === "dot" ? "hidden" : "hidden sm:inline",
            "text-xs t5",
          )}
        >
          ▾
        </span>
      </button>

      {/* Panel (Portal) */}
      <DropdownPortal
        open={open}
        anchorRect={anchorRect}
        width={panelWidth}
        maxHeight={320}
        placement="bottom-end"
        onReposition={() => {
          // 스크롤/리사이즈로 위치 변하면 anchorRect도 다시 잡아주면 더 안정적
          // (부모에서 rect 최신화가 가장 정확)
          // 여기서는 가벼운 갱신만
          requestAnimationFrame(syncAnchor);
        }}
      >
        <DropdownMenuPanel
          ref={panelRef}
          role="menu"
          className={cn("p-2", "overflow-auto")}
          style={{ maxHeight: 320 }}
        >
          {/* ✅ 모바일: dot grid */}
          <div className="grid grid-cols-5 gap-2 sm:hidden">
            {presets.map((p) => {
              const a = getAccentColor(p.tokens);
              const active = p.name === value;
              return (
                <button
                  key={p.name}
                  type="button"
                  role="menuitem"
                  aria-label={p.label}
                  title={p.label}
                  onClick={() => {
                    onChange(p.name);
                    setOpen(false);
                  }}
                  className={cn(
                    "h-9 w-9 rounded-xl border",
                    active
                      ? "border-[var(--border-strong)]"
                      : "border-[var(--border-soft)]",
                    "bg-[var(--bg-elev-2)] hover:bg-[var(--bg-elev-3)]",
                    "inline-flex items-center justify-center",
                  )}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-[var(--border-soft)]"
                    style={{ backgroundColor: a }}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          {/* ✅ 데스크탑: select option 느낌(list) */}
          <div className="hidden sm:block">
            <div className="flex flex-col">
              {presets.map((p) => {
                const a = getAccentColor(p.tokens);
                const active = p.name === value;
                return (
                  <button
                    key={p.name}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onChange(p.name);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-2",
                      "inline-flex items-center gap-2 text-left",
                      "border border-transparent",
                      active
                        ? "bg-[var(--menu-item-hover-bg)] text-[var(--menu-item-hover-fg)] border-[color:var(--border-soft)]"
                        : "text-[var(--menu-item-fg)] hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]",
                      "transition-colors",
                    )}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-[var(--border-soft)]"
                      style={{ backgroundColor: a }}
                      aria-hidden="true"
                    />
                    <span className="text-sm t4">{p.label}</span>
                    {active ? (
                      <span className="ml-auto text-xs t5">✓</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </DropdownMenuPanel>
      </DropdownPortal>
    </div>
  );
}
