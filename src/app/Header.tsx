import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthButton from "@/features/auth/AuthButton";
import { useSession } from "@/features/auth/useSession";
import type { HeaderProps } from "@/features/shiori/type";
import { Button } from "@/shared/ui/primitives/Button";
import { StickyBar } from "@/shared/ui/patterns/StickyBar";
import { PageHeaderRow } from "./layout/PageHeaderRow";
import { DropdownMenuPanel } from "@/shared/ui/patterns/DropdownMenuPanel";
import { THEME_PRESETS } from "@/shared/theme/themes";
import { useTheme } from "@/shared/theme/useTheme";
function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as any)}
      className="rounded-xl border border-[var(--border-soft)] bg-[var(--item-bg)] px-3 py-2 text-sm t2"
    >
      {THEME_PRESETS.map((p) => (
        <option key={p.name} value={p.name}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
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
    <StickyBar>
      {" "}
      <PageHeaderRow>
        {" "}
        {/* Left */}{" "}
        <div className="flex items-center gap-2 min-w-0">
          {" "}
          <Button
            variant="icon"
            aria-label="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            title="Menu"
          >
            {" "}
            <span className="flex flex-col justify-center gap-1">
              {" "}
              <span className="block h-[2px] w-4 bg-current opacity-80" />{" "}
              <span className="block h-[2px] w-4 bg-current opacity-80" />{" "}
              <span className="block h-[2px] w-4 bg-current opacity-80" />{" "}
            </span>{" "}
          </Button>{" "}
          <button
            type="button"
            onClick={() => nav("/")}
            className="cursor-pointer min-w-0 truncate text-lg sm:text-xl font-semibold tracking-tight t2 hover:opacity-90"
            title="Home"
          >
            {" "}
            {title}{" "}
          </button>{" "}
          <span className="shrink-0 text-xs t5">{versionText}</span>{" "}
          {/* Dropdown */}{" "}
          {open && (
            <DropdownMenuPanel
              role="menu"
              aria-label="햄버거 메뉴"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="left-1/2 -translate-x-1/2 top-full mt-2"
            >
              {" "}
              <div className="px-2 py-1 text-xs t5">고객센터</div>{" "}
              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/support"), setOpen(false))}
              >
                {" "}
                📋 전체 문의{" "}
              </Button>{" "}
              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/support/faq"), setOpen(false))}
              >
                {" "}
                ❓ FAQ{" "}
              </Button>{" "}
              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/support/new"), setOpen(false))}
              >
                {" "}
                📝 제보하기{" "}
              </Button>{" "}
              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/support/mine"), setOpen(false))}
              >
                {" "}
                🙋 내 문의{" "}
              </Button>{" "}
              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/support/trash"), setOpen(false))}
              >
                {" "}
                🗑 고객센터 휴지통{" "}
              </Button>{" "}
              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/settings/account"), setOpen(false))}
              >
                {" "}
                ⚙️ 계정 설정{" "}
              </Button>{" "}
              <div className="my-2 border-t border-[var(--border-soft)]" />{" "}
              <div className="px-2 py-1 text-xs t5">기타</div>{" "}
              <Button
                variant="ghost"
                role="menuitem"
                onClick={() => (nav("/trash"), setOpen(false))}
              >
                {" "}
                🗑 일반 휴지통{" "}
              </Button>{" "}
            </DropdownMenuPanel>
          )}{" "}
        </div>{" "}
        {/* Right */}{" "}
        <div className="flex items-center gap-2 shrink-0">
          {" "}
          <ThemeSelect />{" "}
          {isAuthed ? (
            <Button variant="ghost" onClick={() => nav("/logs/new")}>
              {" "}
              + 작성{" "}
            </Button>
          ) : null}{" "}
          <AuthButton />{" "}
        </div>{" "}
      </PageHeaderRow>{" "}
    </StickyBar>
  );
}
