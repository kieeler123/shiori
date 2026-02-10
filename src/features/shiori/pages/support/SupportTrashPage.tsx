import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";

import { dbSupportMyTrashList } from "../../repo/trashRepo";
import type { SupportTrashListRow } from "../../type";

import { Button } from "@/shared/ui/primitives/Button";
import { Surface } from "@/app/layout/Surface";

export default function SupportTrashPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  const [rows, setRows] = useState<SupportTrashListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const data = await dbSupportMyTrashList();
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
    <div className="space-y-4">
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
        <Surface className="border border-red-900/50 bg-red-950/15">
          <div className="text-sm text-red-200">{err}</div>
        </Surface>
      ) : null}

      {/* 리스트 */}
      {loading ? (
        <div className="text-sm text-zinc-300]">불러오는 중…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-zinc-300">휴지통이 비어있어요.</div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Surface key={r.id}>
              <div className="text-zinc-200">{r.title || "(제목 없음)"}</div>
              <div className="mt-1 text-xs text-zinc-300">
                삭제일:{" "}
                {r.deleted_at ? new Date(r.deleted_at).toLocaleString() : "-"}
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
