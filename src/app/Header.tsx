import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthButton from "@/features/auth/AuthButton";
import { useSession } from "@/features/auth/useSession";
import type { HeaderProps } from "@/features/shiori/type";
import { Button } from "@/shared/ui/primitives/Button";
import { StickyBar } from "@/shared/ui/patterns/StickyBar";
import { PageHeaderRow } from "./layout/PageHeaderRow";
import { DropdownMenuPanel } from "@/shared/ui/patterns/DropdownMenuPanel";
import { ThemeSelect } from "@/shared/theme/ThemeSelect";
import { useShioriSearch } from "@/features/shiori/components/search/SearchContext";
import { HeaderSearchBar } from "@/features/shiori/components/HeaderSearchBar";

export default function Header({
  title = "Shiori",
  versionText = "v0",
}: HeaderProps) {
  const nav = useNavigate();
  const location = useLocation();
  const { isAuthed } = useSession();

  const [open, setOpen] = useState(false);

  // 헤더 검색(필요하면 상위로 끌어올리기)
  const [q, _setQ] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const isHome = useMemo(() => location.pathname === "/", [location.pathname]);

  const { clearQuery } = useShioriSearch();

  useEffect(() => {
    setOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

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

  return (
    <StickyBar>
      <PageHeaderRow>
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          {/* 햄버거 버튼은 shrink-0로 고정 */}
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

          {/* ✅ 로고/타이틀: 모바일에서 절대 사라지지 않게 shrink-0 */}
          <button
            type="button"
            onClick={() => {
              clearQuery();
              nav("/");
            }}
            className="
              shrink-0
              cursor-pointer
              text-lg sm:text-xl
              font-semibold tracking-tight
              t2 hover:opacity-90
            "
            title="Home"
          >
            {title}
          </button>

          {/* 버전 텍스트: 공간 부족하면 숨겨도 됨(모바일) */}
          <span className="hidden sm:inline shrink-0 text-xs t5">
            {versionText}
          </span>

          {/* ✅ Desktop Search: 공간 충분할 때만 (md+) */}
          <HeaderSearchBar />

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
              >
                ❓ FAQ
              </Button>

              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/support/new"), setOpen(false))}
              >
                📝 제보하기
              </Button>

              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/support/mine"), setOpen(false))}
              >
                🙋 내 문의
              </Button>

              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/support/trash"), setOpen(false))}
              >
                🗑 고객센터 휴지통
              </Button>

              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/settings/account"), setOpen(false))}
              >
                ⚙️ 계정 설정
              </Button>

              <div className="my-2 border-t [border-color:var(--border-soft)]" />

              <div className="px-2 py-1 text-xs t5">기타</div>

              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/trash"), setOpen(false))}
              >
                🗑 일반 휴지통
              </Button>
            </DropdownMenuPanel>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeSelect />

          {/* ✅ Mobile Search Toggle (md 미만에서만) */}
          <Button
            variant="icon"
            className="md:hidden"
            aria-label="search"
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((v) => !v)}
            title="Search"
          >
            🔎
          </Button>

          {isAuthed ? (
            // 모바일에서 버튼 텍스트 길면 깨질 수 있으니 sm 이상에서만 텍스트/혹은 icon로
            <Button
              variant="ghost"
              onClick={() => nav("/logs/new")}
              className="hidden sm:inline-flex"
            >
              + 작성
            </Button>
          ) : null}

          {/* 모바일에서는 +작성 숨겨도 되면, 아이콘 버튼 하나로 대체 가능
              {isAuthed ? <Button variant="icon" className="sm:hidden" onClick={() => nav("/logs/new")}>+</Button> : null}
          */}

          <AuthButton />
        </div>
      </PageHeaderRow>

      {/* Mobile Search Row */}
      {mobileSearchOpen && (
        <div className="mx-auto max-w-5xl px-4 pb-3 md:hidden">
          <HeaderSearchBar className="w-full" autoFocus placeholder="검색…" />
        </div>
      )}
    </StickyBar>
  );
}
