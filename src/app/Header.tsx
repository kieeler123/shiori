// src/app/Header.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthButton from "@/features/auth/AuthButton";
import type { HeaderProps } from "@/features/shiori/type";
import { Button } from "@/shared/ui/primitives/Button";
import { StickyBar } from "@/shared/ui/patterns/StickyBar";
import { PageHeaderRow } from "./layout/PageHeaderRow";
import { useShioriSearch } from "@/features/shiori/components/search/SearchContext";
import { HeaderSearchBar } from "@/features/shiori/components/HeaderSearchBar";
import { cn } from "@/shared/ui/utils/cn";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import HeaderDropdownMenu from "@/shared/ui/patterns/HeaderDropdownMenu";

export default function Header({
  title = "Shiori",
  versionText = "v1",
  searchOpen,
  onToggleSearch,
  onCloseSearch,
}: HeaderProps) {
  const nav = useNavigate();
  const location = useLocation();
  const { clearQuery } = useShioriSearch();
  const { t } = useI18n();

  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // ✅ 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // ✅ 바깥 클릭/ESC로 닫기
  useEffect(() => {
    if (!open) return;

    function onDocMouseDown(e: MouseEvent) {
      const node = e.target as Node;
      if (menuRef.current?.contains(node)) return;
      if (btnRef.current?.contains(node)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <StickyBar>
      <PageHeaderRow className="relative">
        {/* =========================
    Mobile: 1줄 + 검색 전환형
   ========================= */}
        <div className="sm:hidden w-full">
          {/* ✅ Search mode */}
          <div className={cn(searchOpen ? "block" : "hidden")}>
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                onClick={() => {
                  clearQuery();
                  onCloseSearch();
                }}
                className="shrink-0"
                aria-label={t("common.close")}
                title={t("common.close")}
              >
                ←
              </Button>

              <HeaderSearchBar className="flex-1 min-w-0" autoFocus />
            </div>
          </div>

          {/* ✅ Normal mode */}
          <div
            className={cn(
              searchOpen ? "hidden" : "flex",
              "items-center gap-2 min-w-0",
            )}
          >
            {/* 햄버거 */}
            <Button
              variant="icon"
              aria-label={t("common.menu")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              title={t("common.menu")}
              ref={btnRef as any}
              className="shrink-0"
            >
              <span className="flex flex-col justify-center gap-1">
                <span className="block h-[2px] w-4 bg-current opacity-80" />
                <span className="block h-[2px] w-4 bg-current opacity-80" />
                <span className="block h-[2px] w-4 bg-current opacity-80" />
              </span>
            </Button>

            {/* 로고(짧게) */}
            <button
              type="button"
              onClick={() => {
                clearQuery();
                nav("/");
              }}
              className={cn(
                "shrink-0 h-10 flex items-center",
                "text-lg font-semibold tracking-tight t2 hover:opacity-90",
              )}
              title={t("common.home")}
            >
              {title}
            </button>

            {/* ✅ 작은 검색 pill (input처럼 보이지만 버튼) */}
            <button
              type="button"
              onClick={onToggleSearch}
              className={cn(
                "flex-1 min-w-0",
                "h-10 rounded-2xl border border-[var(--border-soft)]",
                "bg-[var(--input-bg)]/40 backdrop-blur",
                "px-3 text-left",
                "text-sm t5",
                "hover:bg-[var(--input-bg)]/55",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              )}
              aria-label={t("common.search")}
              title={t("common.search")}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="truncate">
                  {t("header.search.placeholder")}
                </span>
                <span className="shrink-0 opacity-70">🔍</span>
              </span>
            </button>

            {/* Auth (컴팩트) */}
            <div className="shrink-0">
              <AuthButton compactOnMobile />
            </div>
          </div>

          {/* Dropdown menu (모바일) */}
          {open && (
            <HeaderDropdownMenu
              open={open}
              onClose={() => setOpen(false)}
              menuRef={menuRef}
            />
          )}
        </div>

        {/* ================================
            Desktop: 검색 크게 + Auth만
           ================================ */}
        <div className="hidden sm:flex w-full items-center gap-3 md:gap-4 min-w-0">
          {/* Left */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0 shrink-0">
            <Button
              variant="icon"
              aria-label={t("common.menu")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              title={t("common.menu")}
              ref={btnRef as any}
              className="shrink-0"
            >
              <span className="flex flex-col justify-center gap-1">
                <span className="block h-[2px] w-4 bg-current opacity-80" />
                <span className="block h-[2px] w-4 bg-current opacity-80" />
                <span className="block h-[2px] w-4 bg-current opacity-80" />
              </span>
            </Button>

            <button
              type="button"
              onClick={() => {
                clearQuery();
                nav("/");
              }}
              className={cn(
                "shrink-0 h-10 flex items-center",
                "text-lg sm:text-xl font-semibold tracking-tight t2 hover:opacity-90",
                "min-w-0 max-w-[10rem] md:max-w-none truncate",
                "cursor-pointer",
              )}
              title={t("common.home")}
            >
              {title}
            </button>

            {/* 버전은 md부터 */}
            <span className="hidden md:inline text-xs t5">{versionText}</span>
          </div>

          {/* Center: big search */}
          <div className="flex-1 min-w-0">
            <div className="w-full min-w-[240px] md:min-w-[320px] max-w-[520px] lg:max-w-[640px] xl:max-w-[720px]">
              <HeaderSearchBar className="w-full" />
            </div>
          </div>

          {/* Right: auth only */}
          <div className="shrink-0">
            {/* md 미만에서는 compactOnMobile 강제 */}
            <div className="md:hidden">
              <AuthButton compactOnMobile />
            </div>
            <div className="hidden md:block">
              <AuthButton />
            </div>
          </div>
        </div>

        {/* Dropdown (both) */}
        {open && (
          <HeaderDropdownMenu
            open={open}
            onClose={() => setOpen(false)}
            menuRef={menuRef}
          />
        )}
      </PageHeaderRow>
    </StickyBar>
  );
}
