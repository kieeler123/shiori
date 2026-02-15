import { Outlet } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import TabButton from "@/shared/ui/primitives/TabButton";
import { PageSection } from "./PageSection";

export default function SupportLayout() {
  const { isAuthed } = useSession();

  return (
    <PageSection>
      {/* ✅ Page가 컨테이너를 이미 갖고 있다면, 여기서 max-w/px/py를 또 주지 말기 */}
      <div className="space-y-4">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--text-strong)]">
            고객센터
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">
            문의 · 제보 · FAQ 관리 영역
          </p>
        </header>
        {/* 탭 */}
        <SurfaceCard className="flex flex-wrap gap-2">
          <TabButton to="/support" end>
            전체 문의
          </TabButton>
          <TabButton to="/support/faq">FAQ</TabButton>

          {isAuthed ? (
            <>
              <TabButton to="/support/new">제보하기</TabButton>
              <TabButton to="/support/mine">내 문의</TabButton>
              <TabButton to="/support/trash">휴지통</TabButton>
            </>
          ) : null}
        </SurfaceCard>
        ;{/* 내용 */}
        <SurfaceCard>
          <Outlet />
        </SurfaceCard>
      </div>
    </PageSection>
  );
}
