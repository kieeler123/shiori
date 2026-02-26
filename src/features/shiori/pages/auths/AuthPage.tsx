import { PageSection } from "@/app/layout/PageSection";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import AuthPanel from "@/features/auth/AuthPanel";

export default function AuthPage() {
  return (
    <PageSection className="space-y-4">
      <SurfaceCard className="space-y-2">
        <h1 className="text-xl font-semibold t2">로그인</h1>

        <p className="text-sm t5">
          Shiori는 로그인한 사용자만 작성, 수정, 삭제가 가능합니다.
        </p>
      </SurfaceCard>

      <SurfaceCard>
        <AuthPanel next="/somewhere" mode="compact" showHint={false} />
      </SurfaceCard>
    </PageSection>
  );
}
