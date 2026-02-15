import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import { dbGet, dbUpdate } from "@/features/shiori/repo/shioriRepo";
import LogEditor from "@/features/shiori/components/LogEditor";
import type { DbLogRow } from "../../type";

import { Button } from "@/shared/ui/primitives/Button";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { PageSection } from "@/app/layout/PageSection";
// 있으면 사용 (없으면 아래 주석 참고)
// import { PageLoadingCard } from "@/shared/ui/patterns/PageLoadingCard";

type EditorSubmitValue = { title: string; content: string; tags: string[] };

export default function EditLogPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthed, userId } = useSession();

  const [item, setItem] = useState<DbLogRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isMine = useMemo(() => {
    if (!isAuthed || !userId) return false;
    return item?.user_id === userId;
  }, [isAuthed, userId, item?.user_id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const row = await dbGet(id);
        setItem(row);
      } finally {
        setLoading(false);
      }
    })().catch(console.error);
  }, [id]);

  async function onSubmit(v: EditorSubmitValue) {
    if (!id) return;
    if (!isAuthed || !isMine) return;

    setBusy(true);
    try {
      const updated = await dbUpdate(id, v);
      setItem(updated);
      nav(`/logs/${id}`, { state: { refresh: true } });
    } catch (e) {
      console.error(e);
      alert(String((e as any)?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    // ✅ 공통 로딩 컴포넌트가 있으면 그걸로 교체 추천
    // return <PageLoadingCard title="수정" message="불러오는 중…" />;

    return (
      <SurfaceCard className="p-4">
        <div className="text-sm t5">불러오는 중…</div>
      </SurfaceCard>
    );
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="soft" onClick={() => nav(-1)}>
            ← 뒤로
          </Button>
        </div>

        <SurfaceCard className="p-4">
          <div className="text-sm t5">존재하지 않는 글입니다.</div>
        </SurfaceCard>
      </div>
    );
  }

  if (!isAuthed || !isMine) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="soft" onClick={() => nav(`/logs/${item.id}`)}>
            상세로
          </Button>
        </div>

        <SurfaceCard className="p-4">
          <div className="text-sm t5">이 글은 작성자만 수정할 수 있어요.</div>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <PageSection>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="text-xs t5">
          {new Date(item.created_at).toLocaleString()}
        </div>

        <Button
          variant="soft"
          onClick={() => nav(`/logs/${item.id}`)}
          disabled={busy}
        >
          닫기
        </Button>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight t2">수정</h1>

      <div className="mt-6">
        <LogEditor
          syncKey={item.id}
          initialTitle={item.title}
          initialContent={item.content}
          initialTags={Array.isArray(item.tags) ? item.tags : []}
          submitLabel={busy ? "처리 중..." : "수정 저장"}
          onCancel={() => nav(`/logs/${item.id}`)}
          onSubmit={onSubmit}
        />
      </div>
    </PageSection>
  );
}
