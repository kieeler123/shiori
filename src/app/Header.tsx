import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthButton from "@/features/auth/AuthButton";
import { useSession } from "@/features/auth/useSession";
import type { HeaderProps } from "@/features/shiori/type";
import { Button } from "@/shared/ui/primitives/Button";
import { DropdownPanel } from "@/shared/ui/patterns/DropdownMenu";

export default function Header({
  title = "Shiori",
  versionText = "v0",
}: HeaderProps) {
  const nav = useNavigate();
  const location = useLocation();
  const { isAuthed } = useSession();

  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setOpen(false);
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
    <DropdownPanel className="sticky top-0 z-30">
      {/* ✅ 전체 폭으로 '일자' 바 */}
      <div className={[""].join(" ")}>
        {/* ✅ 가운데 컨테이너만 max-w */}
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left */}
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="icon"
                aria-label="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                title="Menu"
              >
                <span className="flex flex-col justify-center gap-1">
                  <span className="block h-[2px] w-4 bg-current opacity-80" />
                  <span className="block h-[2px] w-4 bg-current opacity-80" />
                  <span className="block h-[2px] w-4 bg-current opacity-80" />
                </span>
              </Button>

              <button
                type="button"
                onClick={() => nav("/")}
                className="cursor-pointer min-w-0 truncate text-lg sm:text-xl font-semibold tracking-tight text-[var(--text-main)] hover:opacity-90 text-zinc-200"
                title="Home"
              >
                {title}
              </button>

              <span className="shrink-0 text-xs text-[var(--text-sub)]">
                {versionText}
              </span>

              {/* ✅ 드롭다운은 header bar 기준 absolute */}
              {open && (
                <div
                  ref={menuRef}
                  role="menu"
                  aria-label="햄버거 메뉴"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className={[
                    "absolute",
                    "left-1/2 -translate-x-1/2", // ✅ 가운데 기준 정렬(원하면 left-6로 변경 가능)
                    "top-[64px]", // ✅ 헤더 높이에 맞춰 내려줌
                    "z-50 w-64",
                    "rounded-2xl border border-[var(--border-soft)]",
                    "bg-[#0b1020]/95 backdrop-blur",
                    "shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
                    "p-2",
                  ].join(" ")}
                >
                  <div className="px-2 py-1 text-xs text-[var(--text-sub)]">
                    고객센터
                  </div>

                  <Button
                    variant="ghost"
                    role="menuitem"
                    onClick={() => (nav("/support"), setOpen(false))}
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

                  <div className="my-2 border-t border-[var(--border-soft)]" />

                  <div className="px-2 py-1 text-xs text-[var(--text-sub)]">
                    기타
                  </div>
                  <Button
                    variant="ghost"
                    role="menuitem"
                    onClick={() => (nav("/trash"), setOpen(false))}
                  >
                    🗑 일반 휴지통
                  </Button>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
              {isAuthed ? (
                <Button variant="ghost" onClick={() => nav("/logs/new")}>
                  + 작성
                </Button>
              ) : null}
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    </DropdownPanel>
  );
}
