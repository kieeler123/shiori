import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAccountProfile } from "@/features/shiori/account/hooks/useAccountProfile";

// ✅ 스키마 준비 전이면 false 유지 (준비중 모드)
// ✅ 스키마 추가하고 탈퇴(soft delete) 실제 실행할 때 true로 변경
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

      // ✅ profiles soft delete 플래그
      const { error: upErr } = await supabase
        .from("profiles")
        .update({
          is_deleted: true,
          deleted_at: now.toISOString(),
          purge_at: purgeAt.toISOString(),
        })
        .eq("id", profile.userId);

      if (upErr) throw upErr;

      // ✅ 로그아웃
      await supabase.auth.signOut();

      alert("탈퇴 처리 완료 (로그아웃되었습니다)");
      nav("/"); // RequireAuth가 있으면 /auth로 보내도 OK
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
          <h1 className="text-xl font-semibold text-zinc-100">회원 탈퇴</h1>
          <p className="mt-1 text-sm text-zinc-500">
            탈퇴는 되돌리기 어려운 작업이므로 확인 절차를 거칩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => nav("/settings/account")}
          className="rounded-xl border border-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
        >
          ← 돌아가기
        </button>
      </div>

      <section className="mt-6 rounded-2xl border border-red-900/40 bg-zinc-950/60 p-4">
        {loading ? (
          <p className="text-sm text-zinc-400">불러오는 중...</p>
        ) : error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : !profile ? (
          <p className="text-sm text-zinc-400">로그인이 필요합니다.</p>
        ) : (
          <>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
              <p className="text-sm text-zinc-200">
                탈퇴 대상:{" "}
                <span className="font-semibold">
                  {profile.auth?.email ?? "-"}
                </span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                로그인 방식: {profile.auth?.provider ?? "google"} (소셜 로그인)
              </p>
            </div>

            <div className="mt-4 space-y-2 text-sm text-zinc-300">
              <p>• 탈퇴 처리 후에는 서비스 이용이 제한됩니다.</p>
              <p>• 정책에 따라 일정 기간 후 완전 삭제될 수 있습니다.</p>
              <p className="text-xs text-zinc-500">
                * 현재는 Google 로그인만 지원하므로 “비밀번호 기반 계정 삭제”
                과정은 없습니다.
              </p>
            </div>

            {!SOFT_DELETE_ENABLED ? (
              <div className="mt-4 rounded-xl border border-amber-900/40 bg-amber-950/20 px-3 py-2">
                <p className="text-sm text-amber-200">
                  ⚠️ 탈퇴 기능은 아직 준비중입니다.
                </p>
                <p className="mt-1 text-xs text-amber-200/80">
                  soft delete 컬럼(is_deleted, deleted_at, purge_at) 추가 후
                  활성화할 수 있어요.
                </p>
              </div>
            ) : null}

            <div className="mt-4">
              <label className="block text-xs text-zinc-500">
                확인을 위해{" "}
                <span className="text-zinc-200 font-semibold">delete</span> 를
                입력하세요.
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete"
                className="mt-2 w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-red-900/40"
              />
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={onDelete}
                disabled={!canSubmit || processing || !profile}
                className="rounded-xl border border-red-900/40 px-3 py-2 text-sm text-red-200 hover:bg-red-950/30 disabled:opacity-50"
              >
                {processing ? "처리 중..." : "탈퇴 진행"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
