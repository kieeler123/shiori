import { NavLink, Outlet } from "react-router-dom";

const tabBase =
  "px-3 py-2 text-sm rounded-xl transition cursor-pointer border border-zinc-800/60";

const tabActive = "bg-zinc-900 text-zinc-100";
const tabIdle = "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60";

export default function SupportLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">고객센터</h1>
        <p className="mt-1 text-sm text-zinc-400">
          문의 · 제보 · FAQ 관리 영역
        </p>

        {/* 🔹 서브 메뉴 탭 */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Tab to="/support/faq" label="FAQ" />
          <Tab to="/support/new" label="제보하기" />
          <Tab to="/support" label="전체 문의" end />
          <Tab to="/support/mine" label="내 문의" />
          <Tab to="/support/trash" label="휴지통" />
        </div>

        {/* 🔹 실제 페이지 내용 */}
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function Tab({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${tabBase} ${isActive ? tabActive : tabIdle}`
      }
    >
      {label}
    </NavLink>
  );
}
