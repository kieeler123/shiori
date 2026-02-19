import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountProfile } from "@/features/shiori/account/hooks/useAccountProfile";

import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { logout } from "@/lib/authActions";
import { supabase } from "@/lib/supabaseClient";

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

    const ok1 = window.confirm("정말 탈퇴하시겠습니까?");
    if (!ok1) return;

    const ok2 = window.confirm(
      "탈퇴 후 30일 동안만 복구 가능하며, 30일이 지나면 계정/작성글/댓글/문의가 완전 삭제됩니다. 계속할까요?",
    );
    if (!ok2) return;

    try {
      setProcessing(true);

      // ✅ DB에서 한 번에 처리 (profiles + shiori_items + comments + support_tickets soft delete)
      const { error: rpcErr } = await supabase.rpc("request_account_delete");
      if (rpcErr) throw rpcErr;

      // ✅ 세션 종료
      await logout();

      alert("탈퇴 처리 완료: 30일 내 재로그인하면 복구할 수 있습니다.");
      nav("/", { replace: true });
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

        <Button
          variant="soft"
          onClick={() => nav("/settings/account")}
          disabled={processing}
        >
          ← 돌아가기
        </Button>
      </div>

      {/* danger panel */}
      <SurfaceCard className="mt-6 border border-[var(--btn-danger-border)] bg-[var(--bg-elev-1)]">
        {loading ? (
          <p className="text-sm t5">불러오는 중...</p>
        ) : error ? (
          <p className="text-sm text-[var(--btn-danger-fg)]">{error}</p>
        ) : !profile ? (
          <div className="space-y-3">
            <p className="text-sm t5">로그인이 필요합니다.</p>
            <Button variant="soft" onClick={() => nav("/auth")}>
              로그인 페이지로 이동
            </Button>
          </div>
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
              <p>• 탈퇴 즉시 서비스 이용이 제한됩니다.</p>
              <p>
                • <span className="font-semibold t2">30일 내 재로그인</span>하면
                계정이 복구될 수 있습니다.
              </p>
              <p>
                • 30일이 지나면{" "}
                <span className="font-semibold t2">계정 정보</span>와{" "}
                <span className="font-semibold t2">작성 글/댓글/문의</span>가
                완전 삭제됩니다.
              </p>
              <p className="text-xs t6">
                * 현재는 Google 로그인만 지원합니다. 소셜 계정(구글) 자체 삭제는
                Google에서 관리됩니다.
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-xs t5">
                확인을 위해 <span className="font-semibold t2">delete</span> 를
                입력하세요.
              </label>

              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete"
                className="mt-2"
                disabled={processing}
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="danger"
                onClick={onDelete}
                disabled={!canSubmit || processing || !profile}
              >
                {processing ? "처리 중..." : "탈퇴 진행"}
              </Button>

              <Button
                variant="soft"
                type="button"
                disabled={processing}
                onClick={() => setConfirmText("")}
              >
                입력 지우기
              </Button>
            </div>
          </>
        )}
      </SurfaceCard>
    </div>
  );
}
