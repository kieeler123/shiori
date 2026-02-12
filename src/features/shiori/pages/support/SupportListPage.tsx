import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";

import { dbSupportList } from "@/features/shiori/repo/supportRepo";
import type { SupportTicketListRow } from "../../type";

import { Button } from "@/shared/ui/primitives/Button";
import { CardButton } from "@/shared/ui/primitives/CardButton";
import TagChip from "@/shared/ui/primitives/TagChip";
import { ListItemButton } from "@/shared/ui/patterns/ListItemButton";
import { previewText } from "../../utils/previewOneLine";

export default function SupportListPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { ready, isAuthed } = useSession();

  const [rows, setRows] = useState<SupportTicketListRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load({ toTop = false } = {}) {
    setLoading(true);
    try {
      const data = await dbSupportList();
      setRows(data);

      if (toTop) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;

    const needsTop = Boolean((location.state as any)?.refresh);

    (async () => {
      await load({ toTop: needsTop });

      // ✅ refresh state 제거
      if (needsTop) {
        nav("/support", { replace: true, state: null });
      }
    })().catch(console.error);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, location.key]);

  return (
    <section className="mt-6 space-y-3">
      {/* Top actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs t5">
          {loading ? "불러오는 중…" : `${rows.length}건`}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="soft" onClick={() => nav("/support/mine")}>
            내 문의
          </Button>
          <Button variant="soft" onClick={() => nav("/support/trash")}>
            휴지통
          </Button>
          <Button variant="primary" onClick={() => nav("/support/new")}>
            문의하기
          </Button>
        </div>
      </div>

      {/* Auth hint */}
      {!isAuthed ? (
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-4">
          <div className="text-sm text-[var(--text-sub)] mb-3">
            문의 작성/내 문의 보기 기능은 로그인 후 사용 가능해요.
          </div>
          <AuthPanel />
        </div>
      ) : null}

      {/* List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="text-sm text-[var(--text-sub)]">불러오는 중…</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-[var(--text-sub)]">
            아직 문의가 없습니다.
          </div>
        ) : (
          rows.map((r) => (
            <ListItemButton
              key={r.id}
              className="surface-1"
              onClick={() => nav(`/support/${r.id}`)}
              title="상세 보기"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm t2">
                    {r.title || "(제목 없음)"}
                  </div>

                  {/* ✅ 1줄 미리보기(원하면 content 매핑해서 넣어) */}
                  {r.body ? (
                    <div className="mt-1 truncate text-xs text-zinc-400">
                      {previewText(r.body, 110)}
                    </div>
                  ) : null}

                  <div className="mt-1 text-xs t5">
                    {r.nickname} · {new Date(r.created_at).toLocaleString()}
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
    </section>
  );
}
