import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";

import { dbMyTickets } from "@/features/shiori/repo/supportRepo";
import type { SupportTicketListRow } from "../../type";

import { Button } from "@/shared/ui/primitives/Button";
import { CardButton } from "@/shared/ui/primitives/CardButton";
import TagChip from "@/shared/ui/primitives/TagChip";

export default function MyTicketsPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  const [rows, setRows] = useState<SupportTicketListRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await dbMyTickets();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || !isAuthed) return;
    load().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isAuthed]);

  // ✅ SupportLayout 안에 있으니 "세션 확인중"도 간단히
  if (!ready) {
    return <div className="text-sm text-[var(--text-sub)]">세션 확인중…</div>;
  }

  if (!isAuthed) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-[var(--text-sub)]">
          로그인 후 확인할 수 있어요.
        </div>
        <AuthPanel />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-zinc-200">
          {loading ? "불러오는 중…" : `${rows.length}건`}
        </div>

        <Button variant="soft" onClick={() => nav("/support")}>
          전체 문의
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-[var(--text-sub)]">불러오는 중…</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-[var(--text-sub)]">
            작성한 문의가 없습니다.
          </div>
        ) : (
          rows.map((r) => (
            <CardButton
              key={r.id}
              onClick={() => nav(`/support/${r.id}`)}
              title="상세 보기"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-[var(--text-main)]">
                    {r.title || "(제목 없음)"}
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-sub)]">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>

                {/* 상태 배지 */}
                <TagChip variant="display" size="sm" active>
                  {r.status}
                </TagChip>
              </div>
            </CardButton>
          ))
        )}
      </div>
    </div>
  );
}
