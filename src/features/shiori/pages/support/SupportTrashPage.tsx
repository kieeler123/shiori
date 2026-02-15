import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
import type { SupportTrashListRow } from "../../type";

import { Button } from "@/shared/ui/primitives/Button";
import { PageSection } from "@/app/layout/PageSection";
import { previewText } from "../../utils/previewOneLine";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import {
  dbSupportTrashHardDelete,
  dbSupportTrashListMine,
  dbSupportTrashRestore,
} from "../../repo/supportTrashRepo";

export default function SupportTrashPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  const [rows, setRows] = useState<SupportTrashListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const data = await dbSupportTrashListMine();
      setRows(data);
    } catch (e) {
      console.error("support trash load failed:", e);
      setErr(String((e as any)?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthed) return;
    load().catch(console.error);
  }, [ready, isAuthed, load]);

  async function restore(id: string) {
    setBusy(true);
    await dbSupportTrashRestore(id);
    await load();
    setBusy(false);
  }

  async function hardDelete(id: string) {
    if (!confirm("완전 삭제됩니다. 복구 불가")) return;
    setBusy(true);
    await dbSupportTrashHardDelete(id);
    await load();
    setBusy(false);
  }

  // SupportLayout 안에서 쓰는 전제: 로그인 없으면 안내 + AuthPanel
  if (!ready) {
    return <div className="text-sm text-[var(--text-sub)]">세션 확인중…</div>;
  }

  if (!isAuthed) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          고객센터 휴지통
        </h2>
        <div className="text-sm text-[var(--text-sub)]">
          로그인 후 확인할 수 있어요.
        </div>
        <AuthPanel />
      </div>
    );
  }

  return (
    <PageSection>
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-200">
          고객센터 휴지통
        </h2>

        <div className="flex items-center gap-2">
          <Button variant="soft" onClick={() => nav("/support")}>
            목록
          </Button>
          <Button variant="soft" onClick={load} disabled={loading}>
            {loading ? "불러오는 중…" : "새로고침"}
          </Button>
        </div>
      </div>

      {/* 메타 */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-300">
          {loading ? "불러오는 중…" : `${rows.length}건`}
        </div>
      </div>

      {/* 에러 */}
      {err ? (
        <SurfaceCard className="border border-red-900/50 bg-red-950/15">
          <div className="text-sm text-red-200">{err}</div>
        </SurfaceCard>
      ) : null}

      {/* 리스트 */}
      {loading ? (
        <div className="text-sm text-zinc-300">불러오는 중…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-zinc-300">휴지통이 비어있어요.</div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <SurfaceCard
              key={r.id}
              className="space-y-2 text-left rounded-2xl p-4"
            >
              <div className="text-zinc-200">{r.title || "(제목 없음)"}</div>
              {/* ✅ 1줄 미리보기(원하면 content 매핑해서 넣어) */}
              {r.body ? (
                <div className="mt-1 truncate text-xs text-zinc-400">
                  {previewText(r.body, 110)}
                </div>
              ) : null}
              <div className="mt-1 text-xs text-zinc-300">
                삭제일:{" "}
                {r.deleted_at ? new Date(r.deleted_at).toLocaleString() : "-"}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="soft"
                  onClick={() => restore(r.id)}
                  disabled={busy}
                >
                  복구
                </Button>
                <Button
                  variant="danger"
                  onClick={() => hardDelete(r.id)}
                  disabled={busy}
                  className="px-3 py-1 rounded border text-xs text-red-400"
                >
                  완전삭제
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </PageSection>
  );
}
