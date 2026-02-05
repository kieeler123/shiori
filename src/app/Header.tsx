import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthButton from "@/features/auth/AuthButton";
import { useSession } from "@/features/auth/useSession";
import { btnBase, menuItem } from "./ui/btn";

type HeaderProps = {
  title?: string;
  versionText?: string;
};

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

  // ✅ 라우트가 바뀌면 메뉴 닫기
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // ✅ 바깥 클릭/ESC로 닫기
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

  const actionBtn =
    "cursor-pointer rounded-xl px-3 py-2 text-sm transition " +
    "text-zinc-300 hover:text-zinc-100 " +
    "hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

  function go(path: string) {
    nav(path);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Title + Hamburger */}
          <div className="flex items-center gap-2 min-w-0">
            {/* 햄버거 버튼 */}
            <button
              ref={btnRef}
              type="button"
              aria-label="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={btnBase}
            >
              <span className="block h-[2px] w-4 bg-zinc-300" />
              <span className="mt-1 block h-[2px] w-4 bg-zinc-300" />
              <span className="mt-1 block h-[2px] w-4 bg-zinc-300" />
            </button>

            {/* 홈 타이틀 */}
            <button
              type="button"
              onClick={() => nav("/")}
              className="cursor-pointer min-w-0 truncate text-xl font-semibold tracking-tight text-zinc-100 hover:text-white"
              title="홈"
            >
              {title}
            </button>

            <span className="shrink-0 text-xs text-zinc-500">
              {versionText}
            </span>

            {open && (
              <div
                ref={menuRef}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-4 top-14 z-50 w-60 rounded-2xl border border-zinc-800/60 bg-zinc-950/95 p-2 shadow-xl"
              >
                {/* ✅ 고객센터 섹션 */}
                <div className="px-2 py-1 text-xs text-zinc-500">고객센터</div>

                <button
                  type="button"
                  className={menuItem}
                  onClick={() => {
                    nav("/support");
                    setOpen(false);
                  }}
                >
                  📋 전체 문의
                </button>

                <button
                  type="button"
                  className={menuItem}
                  onClick={() => {
                    nav("/support/faq");
                    setOpen(false);
                  }}
                >
                  ❓ FAQ
                </button>

                <button
                  type="button"
                  className={menuItem}
                  onClick={() => {
                    nav("/support/new");
                    setOpen(false);
                  }}
                >
                  📝 제보하기
                </button>

                <button
                  type="button"
                  className={menuItem}
                  onClick={() => {
                    nav("/support/mine");
                    setOpen(false);
                  }}
                >
                  🙋 내 문의
                </button>

                <button
                  type="button"
                  className={menuItem}
                  onClick={() => {
                    nav("/support/trash");
                    setOpen(false);
                  }}
                >
                  🗑 고객센터 휴지통
                </button>

                <div className="my-2 border-t border-zinc-800/60" />

                {/* ✅ 일반 영역 */}
                <div className="px-2 py-1 text-xs text-zinc-500">기타</div>

                <button
                  type="button"
                  className={menuItem}
                  onClick={() => {
                    nav("/trash");
                    setOpen(false);
                  }}
                >
                  🗑 일반 휴지통
                </button>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthed ? (
              <button
                type="button"
                className={actionBtn}
                onClick={() => nav("/logs/new")}
              >
                + 작성
              </button>
            ) : null}

            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
