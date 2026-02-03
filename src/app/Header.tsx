import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthButton from "@/features/auth/AuthButton";
import { useSession } from "@/features/auth/useSession";

type HeaderProps = {
  title?: string; // 기본 "Shiori"
  versionText?: string; // 예: "v0"
  onRefresh?: () => void | Promise<void>; // 목록 새로고침 버튼(원할 때만)
  showRefresh?: boolean; // 새로고침 버튼 표시 여부
};

export default function Header({
  title = "Shiori",
  versionText = "v0",
  onRefresh,
  showRefresh = false,
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

  // ✅ 바깥 클릭으로 닫기
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

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Title + Hamburger */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              ref={btnRef}
              type="button"
              aria-label="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="shrink-0 rounded-xl border border-zinc-800/70 px-3 py-2 text-zinc-300 hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-zinc-700/60"
            >
              {/* 햄버거 아이콘(심플) */}
              <span className="block h-[2px] w-4 bg-zinc-300" />
              <span className="mt-1 block h-[2px] w-4 bg-zinc-300" />
              <span className="mt-1 block h-[2px] w-4 bg-zinc-300" />
            </button>

            <button
              type="button"
              onClick={() => nav("/")}
              className="min-w-0 truncate text-xl font-semibold tracking-tight text-zinc-100 hover:text-white"
              title="홈"
            >
              {title}
            </button>

            <span className="shrink-0 text-xs text-zinc-500">
              {versionText}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {showRefresh && onRefresh ? (
              <button
                type="button"
                className={actionBtn}
                onClick={() => void onRefresh()}
              >
                새로고침
              </button>
            ) : null}

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

        {/* Dropdown Menu */}
        {open ? (
          <div className="relative">
            <div
              ref={menuRef}
              className="
                absolute left-0 mt-3 w-56 overflow-hidden
                rounded-2xl border border-zinc-800/70 bg-zinc-950/95 shadow-lg
              "
            >
              <MenuItem
                label="휴지통"
                onClick={() => nav("/trash")}
                desc="내가 삭제한 글"
              />
              <div className="h-px bg-zinc-800/60" />
              <MenuItem
                label="고객센터"
                onClick={() => nav("/support")}
                desc="제보/문의 목록"
              />
              <MenuItem
                label="제보하기"
                onClick={() => nav("/support/new")}
                desc="버그/건의 작성"
              />
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function MenuItem({
  label,
  desc,
  onClick,
}: {
  label: string;
  desc?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full text-left px-4 py-3
        hover:bg-zinc-900/60 transition
        focus:outline-none focus:ring-2 focus:ring-zinc-700/60
      "
    >
      <div className="text-sm text-zinc-200">{label}</div>
      {desc ? <div className="mt-0.5 text-xs text-zinc-500">{desc}</div> : null}
    </button>
  );
}
