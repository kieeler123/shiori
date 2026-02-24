import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthButton from "@/features/auth/AuthButton";
import type { HeaderProps } from "@/features/shiori/type";
import { Button } from "@/shared/ui/primitives/Button";
import { StickyBar } from "@/shared/ui/patterns/StickyBar";
import { PageHeaderRow } from "./layout/PageHeaderRow";
import { DropdownMenuPanel } from "@/shared/ui/patterns/DropdownMenuPanel";
import { useShioriSearch } from "@/features/shiori/components/search/SearchContext";
import { HeaderSearchBar } from "@/features/shiori/components/HeaderSearchBar";
import { THEME_PRESETS } from "@/shared/theme/theme.presets";
import ThemeSelectCompact from "@/shared/theme/ThemeSelectCompact";
import { useTheme } from "@/shared/theme/useTheme";
import { cn } from "@/shared/ui/utils/cn";

export default function Header({
  title = "Shiori",
  versionText = "v0",
  searchOpen,
  onToggleSearch,
  onCloseSearch,
}: HeaderProps) {
  const nav = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const { clearQuery } = useShioriSearch();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setOpen(false);
    onCloseSearch(); // ✅ 페이지 이동 시 검색모드 닫기 (원치 않으면 제거)
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;

    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
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

  // ✅ 모바일 검색모드에서는 메뉴도 닫아버리는 게 UX 좋음
  useEffect(() => {
    if (searchOpen) setOpen(false);
  }, [searchOpen]);

  return (
    <StickyBar>
      <PageHeaderRow>
        {/* ✅ Mobile search mode (헤더 전체 전환) */}
        <div
          className={cn("sm:hidden w-full", searchOpen ? "block" : "hidden")}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              onClick={() => {
                clearQuery();
                onCloseSearch();
              }}
              className="shrink-0"
              aria-label="검색 닫기"
              title="닫기"
            >
              ←
            </Button>

            <HeaderSearchBar className="flex-1 min-w-0" autoFocus />
          </div>
        </div>

        {/* ✅ Normal header (mobile + desktop) */}
        <div className={cn("w-full", searchOpen ? "hidden sm:flex" : "flex")}>
          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            {/* 햄버거 */}
            <Button
              variant="icon"
              aria-label="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              title="Menu"
              ref={btnRef as any}
              className="shrink-0"
            >
              <span className="flex flex-col justify-center gap-1">
                <span className="block h-[2px] w-4 bg-current opacity-80" />
                <span className="block h-[2px] w-4 bg-current opacity-80" />
                <span className="block h-[2px] w-4 bg-current opacity-80" />
              </span>
            </Button>

            {/* 로고 */}
            <button
              type="button"
              onClick={() => {
                clearQuery();
                nav("/");
              }}
              className="shrink-0 cursor-pointer text-lg sm:text-xl font-semibold tracking-tight t2 hover:opacity-90"
              title="Home"
            >
              {title}
            </button>

            {/* 버전 */}
            <span className="hidden sm:inline shrink-0 text-xs t5">
              {versionText}
            </span>

            {/* ✅ Desktop Search only */}
            <div className="hidden sm:block">
              <HeaderSearchBar />
            </div>

            {/* ✅ Mobile search icon (input은 안 보이고 아이콘만) */}
            {/* ✅ 로고와 검색 사이만 띄움 */}
            <div className="w-2 sm:w-3" />
            <div className="sm:hidden shrink-0">
              <Button
                variant="icon"
                aria-label="검색 열기"
                title="검색"
                onClick={onToggleSearch}
              >
                🔍
              </Button>
            </div>
            {/* ✅ 스페이서: 여기서부터 오른쪽으로 밀기 */}
            <div className="flex-1" />
            {/* ✅ NEW — Theme 위치 이동 */}
            <div className="shrink-0 ml-1 sm:ml-2">
              <ThemeSelectCompact
                value={theme}
                presets={THEME_PRESETS}
                onChange={setTheme}
                mode="auto"
                panelWidth={280}
              />
            </div>

            {/* Dropdown */}
            {open && (
              <DropdownMenuPanel
                ref={menuRef as any}
                role="menu"
                aria-label="햄버거 메뉴"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="left-1/2 -translate-x-1/2 top-full mt-2"
              >
                <div className="px-2 py-1 text-xs t5">고객센터</div>

                <Button
                  variant="ghost"
                  role="menuitem"
                  onClick={() => (nav("/support"), setOpen(false))}
                  className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
                >
                  📋 전체 문의
                </Button>

                <Button
                  variant="ghost"
                  role="menuitem"
                  onClick={() => (nav("/support/faq"), setOpen(false))}
                  className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
                >
                  ❓ FAQ
                </Button>

                <Button
                  variant="ghost"
                  role="menuitem"
                  onClick={() => (nav("/support/new"), setOpen(false))}
                  className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
                >
                  📝 제보하기
                </Button>

                <Button
                  variant="ghost"
                  role="menuitem"
                  onClick={() => (nav("/support/mine"), setOpen(false))}
                  className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
                >
                  🙋 내 문의
                </Button>

                <Button
                  variant="ghost"
                  role="menuitem"
                  onClick={() => (nav("/support/trash"), setOpen(false))}
                  className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
                >
                  🗑 고객센터 휴지통
                </Button>

                <Button
                  variant="ghost"
                  role="menuitem"
                  onClick={() => (nav("/settings/account"), setOpen(false))}
                  className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
                >
                  ⚙️ 계정 설정
                </Button>

                <div className="my-2 border-t [border-color:var(--border-soft)]" />

                <div className="px-2 py-1 text-xs t5">기타</div>

                <Button
                  variant="ghost"
                  role="menuitem"
                  onClick={() => (nav("/trash"), setOpen(false))}
                  className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
                >
                  🗑 일반 휴지통
                </Button>
              </DropdownMenuPanel>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center shrink-0 ml-auto">
            <AuthButton compactOnMobile />
          </div>
        </div>
      </PageHeaderRow>
    </StickyBar>
  );
}
