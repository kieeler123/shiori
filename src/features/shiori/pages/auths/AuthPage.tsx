import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AuthBar from "@/features/auth/AuthBar";

import { PageSection } from "@/app/layout/PageSection";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";

export default function AuthPage() {
  const [sp] = useSearchParams();
  const next = useMemo(() => sp.get("next") ?? "/", [sp]);

  return (
    <PageSection className="space-y-4">
      <SurfaceCard className="space-y-2">
        <h1 className="text-xl font-semibold t2">로그인</h1>

        <p className="text-sm t5">
          Shiori는 로그인한 사용자만 작성, 수정, 삭제가 가능합니다.
        </p>
      </SurfaceCard>

      <SurfaceCard>
        <AuthBar next={next} />
      </SurfaceCard>
    </PageSection>
  );
}
