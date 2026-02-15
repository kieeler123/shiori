import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAccountProfile } from "@/features/shiori/account/hooks/useAccountProfile";

import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
// PageContainer 있으면 쓰는 게 제일 깔끔
// import { PageContainer } from "@/app/layout/PageContainer";

const SOFT_DELETE_ENABLED = false;

export default function AccountDeletePage() {
  const nav = useNavigate();
  const { loading, profile, error } = useAccountProfile();

  const [confirmText, setConfirmText] = useState("");
  const [processing, setProcessing] = useState(false);

  const canSubmit = useMemo(() => {
    return confirmText.trim().toLowerCase() === "delete";
  }, [confirmText]);

  async function onDelete() {
    if (!profile) return;

    if (!SOFT_DELETE_ENABLED) {
      alert("탈퇴 기능은 아직 준비중입니다. (DB 스키마 추가 후 활성화)");
      return;
    }

    const ok1 = window.confirm("정말 탈퇴하시겠습니까?");
    if (!ok1) return;

    const ok2 = window.confirm(
      "탈퇴 후 1년간 복구 가능(정책에 따라)하며, 이후 완전 삭제될 수 있습니다. 계속할까요?",
    );
    if (!ok2) return;

    try {
      setProcessing(true);

      const now = new Date();
      const purgeAt = new Date(now);
      purgeAt.setFullYear(purgeAt.getFullYear() + 1);

      const { error: upErr } = await supabase
        .from("profiles")
        .update({
          is_deleted: true,
          deleted_at: now.toISOString(),
          purge_at: purgeAt.toISOString(),
        })
        .eq("id", profile.userId);

      if (upErr) throw upErr;

      await supabase.auth.signOut();
      alert("탈퇴 처리 완료 (로그아웃되었습니다)");
      nav("/");
    } catch (e: any) {
      alert(e?.message ?? "탈퇴 처리 실패");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold t2">회원 탈퇴</h1>
          <p className="mt-1 text-sm t5">
            탈퇴는 되돌리기 어려운 작업이므로 확인 절차를 거칩니다.
          </p>
        </div>

        <Button variant="soft" onClick={() => nav("/settings/account")}>
          ← 돌아가기
        </Button>
      </div>

      {/* danger panel 느낌 (현재는 토큰만으로 표현) */}
      <SurfaceCard className="mt-6 border border-[var(--btn-danger-border)] bg-[var(--bg-elev-1)]">
        {loading ? (
          <p className="text-sm t5">불러오는 중...</p>
        ) : error ? (
          <p className="text-sm text-[var(--btn-danger-fg)]">{error}</p>
        ) : !profile ? (
          <p className="text-sm t5">로그인이 필요합니다.</p>
        ) : (
          <>
            <SurfaceCard className="border border-[var(--border-soft)] bg-[var(--bg-elev-2)]">
              <p className="text-sm t3">
                탈퇴 대상:{" "}
                <span className="font-semibold t2">
                  {profile.auth?.email ?? "-"}
                </span>
              </p>
              <p className="mt-1 text-xs t5">
                로그인 방식: {profile.auth?.provider ?? "google"} (소셜 로그인)
              </p>
            </SurfaceCard>

            <div className="mt-4 space-y-2 text-sm t4">
              <p>• 탈퇴 처리 후에는 서비스 이용이 제한됩니다.</p>
              <p>• 정책에 따라 일정 기간 후 완전 삭제될 수 있습니다.</p>
              <p className="text-xs t5">
                * 현재는 Google 로그인만 지원하므로 “비밀번호 기반 계정 삭제”
                과정은 없습니다.
              </p>
            </div>

            {!SOFT_DELETE_ENABLED ? (
              <SurfaceCard className="mt-4 border border-[var(--border-strong)] bg-[var(--bg-elev-2)]">
                <p className="text-sm t3">⚠️ 탈퇴 기능은 아직 준비중입니다.</p>
                <p className="mt-1 text-xs t5">
                  soft delete 컬럼(is_deleted, deleted_at, purge_at) 추가 후
                  활성화할 수 있어요.
                </p>
              </SurfaceCard>
            ) : null}

            <div className="mt-4">
              <label className="block text-xs t5">
                확인을 위해 <span className="font-semibold t2">delete</span> 를
                입력하세요.
              </label>

              {/* Input 프리미티브가 토큰 기반이면 그걸로 통일 */}
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete"
                className="mt-2"
              />
            </div>

            <div className="mt-3">
              <Button
                variant="danger"
                onClick={onDelete}
                disabled={!canSubmit || processing || !profile}
              >
                {processing ? "처리 중..." : "탈퇴 진행"}
              </Button>
            </div>
          </>
        )}
      </SurfaceCard>
    </div>
    // </PageContainer>
  );
}
