import { NavLink, Outlet } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { Page } from "./Page";
import { Surface } from "./Surface";
import { tabActive, tabBase, tabIdle } from "../ui/btn";

export default function SupportLayout() {
  const { isAuthed } = useSession();

  return (
    <Page>
      {/* ✅ Page가 컨테이너를 이미 갖고 있다면, 여기서 max-w/px/py를 또 주지 말기 */}
      <div className="space-y-4">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight  text-zinc-200">
            고객센터
          </h1>
          <p className="mt-1 text-sm  text-zinc-200">
            문의 · 제보 · FAQ 관리 영역
          </p>
        </header>

        {/* 탭 */}
        <Surface className="flex flex-wrap gap-2">
          <Tab to="/support" label="전체 문의" end />
          <Tab to="/support/faq" label="FAQ" />

          {/* 보호 라우트는 로그인 시에만 노출(UX 깔끔) */}
          {isAuthed ? (
            <>
              <Tab to="/support/new" label="제보하기" />
              <Tab to="/support/mine" label="내 문의" />
              <Tab to="/support/trash" label="휴지통" />
            </>
          ) : null}
        </Surface>

        {/* 내용 */}
        <Surface>
          <Outlet />
        </Surface>
      </div>
    </Page>
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
