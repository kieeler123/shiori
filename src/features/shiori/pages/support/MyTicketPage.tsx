import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";

import { dbMyTickets } from "@/features/shiori/repo/supportRepo";
import type { SupportTicketListRow } from "../../type";

import { Button } from "@/shared/ui/primitives/Button";
import TagChip from "@/shared/ui/primitives/TagChip";
import { ListItemButton } from "@/shared/ui/patterns/ListItemButton";
import { previewText } from "../../utils/previewOneLine";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

export default function MyTicketsPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  const [rows, setRows] = useState<SupportTicketListRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rows.length > 0) {
      console.log("sample row:", rows[0]);
    }
  }, [rows]);

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
    return <LoadingText label="세션 확인중…" />;
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
    <>
      {/* Top */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="soft" onClick={() => nav("/support")}>
          전체 문의
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <LoadingText size="sm" />
        ) : rows.length === 0 ? (
          <EmptyState>작성한 문의가 없습니다.</EmptyState>
        ) : (
          rows.map((r) => (
            <ListItemButton
              className="space-y-2"
              key={r.id}
              onClick={() => nav(`/support/${r.id}`)}
              title="상세 보기"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm t2">
                    {r.title || "(제목 없음)"}
                  </div>
                  <div className="mt-1 text-xs t4">
                    {previewText(r.body, 110)}
                  </div>
                  <div className="mt-1 text-xs t5">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>

                {/* 상태 배지 */}
                <TagChip variant="display" size="sm" active>
                  {r.status}
                </TagChip>
              </div>
            </ListItemButton>
          ))
        )}
      </div>
    </>
  );
}
