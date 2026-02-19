import { Outlet } from "react-router-dom";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { PageSection } from "@/app/layout/PageSection";
import { useAutoRestoreAccount } from "@/features/shiori/utils/useAutoRestoreAccount";

export default function AccountLayout() {
  useAutoRestoreAccount();
  return (
    <PageSection className="space-y-4">
      {/* ✅ 공통 Header (Account 영역 공통) */}
      <SurfaceCard className="space-y-1">
        <h1 className="text-xl font-semibold t2">계정 설정</h1>
        <p className="text-sm t5">
          소셜 원본은 유지하고, 앱 내 프로필은 Shiori에서만 수정됩니다.
        </p>
      </SurfaceCard>

      {/* ✅ 하위 페이지 */}
      <Outlet />
    </PageSection>
  );
}
