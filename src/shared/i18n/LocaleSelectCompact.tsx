// src/shared/i18n/LocaleSelectCompact.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/ui/utils/cn";
import { DropdownPortal } from "@/shared/ui/patterns/DropdownPortal";
import { DropdownMenuPanel } from "@/shared/ui/patterns/DropdownMenuPanel";
import { useI18n } from "@/shared/i18n/LocaleProvider";

type Mode = "auto" | "icon" | "label";

type LocaleOption = {
  value: string; // "ko" | "en" | "ja" | ...
  label: string; // 한국어 / English / 日本語 ...
  short?: string; // KO / EN / JA (optional)
};

type Props = {
  className?: string;
  mode?: Mode;
  panelWidth?: number;
  // 프로젝트에 이미 locale 목록/제약이 있으면 여기서 주입해도 됨
  options?: LocaleOption[];
};

export type Locale = "ko" | "en" | "ja" | "zh";

const DEFAULT_OPTIONS: LocaleOption[] = [
  { value: "ko", label: "한국어", short: "KO" },
  { value: "en", label: "English", short: "EN" },
  { value: "ja", label: "日本語", short: "JA" },
  { value: "zh", label: "中文", short: "ZH" },
];

function localeIcon(locale: string) {
  // 취향: 깃발 이모지/지구본/문자
  locale;
  return "🌐";
}

export default function LocaleSelectCompact({
  className,
  mode = "auto",
  panelWidth = 220,
  options = DEFAULT_OPTIONS,
}: Props) {
  const { t, locale, setLocale } = useI18n();

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const current = useMemo(() => {
    const found = options.find((o) => o.value === locale);
    return found ?? options[0];
  }, [options, locale]);

  function syncAnchor() {
    const r = btnRef.current?.getBoundingClientRect() ?? null;
    setAnchorRect(r);
  }

  useEffect(() => {
    if (!open) return;
    syncAnchor();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      const node = e.target as Node;
      if (btnRef.current?.contains(node)) return;
      if (panelRef.current?.contains(node)) return;
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

  // 라벨 노출 규칙 (ThemeSelectCompact와 동일)
  const labelClass =
    mode === "icon"
      ? "hidden"
      : mode === "label"
        ? "inline text-sm t5"
        : "hidden sm:inline text-sm t5";

  const btnSizeClass =
    mode === "icon"
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
        aria-label={t("common.localeChange")}
        title={t("common.localeChange")}
        onClick={() => {
          setOpen((v) => !v);
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
        <span aria-hidden="true">{localeIcon(locale)}</span>
        <span className={labelClass}>
          {/* 데스크탑 라벨: “한국어/English/日本語” 같은 표시 */}
          {current.label}
        </span>

        <span
          className={cn(
            mode === "icon" ? "hidden" : "hidden sm:inline",
            "text-xs t5",
          )}
        >
          ▾
        </span>
      </button>

      {/* Panel */}
      <DropdownPortal
        open={open}
        anchorRect={anchorRect}
        width={panelWidth}
        maxHeight={320}
        placement="bottom-end"
        onReposition={() => requestAnimationFrame(syncAnchor)}
      >
        <DropdownMenuPanel
          ref={panelRef}
          role="menu"
          className={cn("p-2", "overflow-auto")}
          style={{ maxHeight: 320 }}
        >
          {/* 모바일: 2~3열 버튼 그리드 (ThemeSelect dot grid 느낌) */}
          <div className="grid grid-cols-3 gap-2 sm:hidden">
            {options.map((o) => {
              const active = o.value === locale;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="menuitem"
                  aria-label={o.label}
                  title={o.label}
                  onClick={() => {
                    setLocale(o.value as any);
                    setOpen(false);
                  }}
                  className={cn(
                    "h-10 rounded-xl border",
                    active
                      ? "border-[var(--border-strong)]"
                      : "border-[var(--border-soft)]",
                    "bg-[var(--bg-elev-2)] hover:bg-[var(--bg-elev-3)]",
                    "inline-flex items-center justify-center",
                  )}
                >
                  <span className="text-sm t4">{o.short ?? o.label}</span>
                </button>
              );
            })}
          </div>

          {/* 데스크탑: list */}
          <div className="hidden sm:block">
            <div className="flex flex-col">
              {options.map((o) => {
                const active = o.value === locale;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setLocale(o.value as any);
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
                    <span className="text-sm t4 leading-none whitespace-nowrap">
                      {o.label}
                    </span>

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
