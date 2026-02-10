import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import { dbSupportGet } from "@/features/shiori/repo/supportRepo";
import { dbSupportSoftDelete } from "@/features/shiori/repo/supportTrashRepo";

import type { SupportTicketDetailRow } from "../../type";
import { isUuid } from "@/features/shiori/utils/isUuid";
import RouteProblem from "@/features/shiori/components/RouteProblem";

import { Button } from "@/shared/ui/primitives/Button";
import TagChip from "@/shared/ui/primitives/TagChip";
import { Surface } from "@/app/layout/Surface";

export default function SupportDetailPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { ready, isAuthed, userId } = useSession();

  const [item, setItem] = useState<SupportTicketDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // ✅ UUID 체크
  if (!isUuid(id)) {
    return (
      <RouteProblem
        title="잘못된 주소"
        message="support id가 uuid 형식이 아니라 조회할 수 없어요."
        hint={`받은 값: ${String(id)}\n해결: /support/new 를 :id 보다 먼저 라우팅하세요.`}
      />
    );
  }

  // ✅ 내가 쓴 글인지
  const isMine = useMemo(() => {
    if (!isAuthed || !userId) return false;
    return item?.user_id === userId;
  }, [isAuthed, userId, item?.user_id]);

  // ✅ 데이터 로딩
  useEffect(() => {
    if (!ready) return;

    (async () => {
      setLoading(true);
      try {
        const row = await dbSupportGet(id);
        setItem(row);
      } finally {
        setLoading(false);
      }
    })().catch(console.error);
  }, [ready, id]);

  // ✅ 삭제
  async function remove() {
    if (!isMine) return;
    if (!confirm("휴지통으로 이동할까요?")) return;

    setBusy(true);
    try {
      await dbSupportSoftDelete(id!);
      nav("/support", { state: { refresh: true } });
    } finally {
      setBusy(false);
    }
  }

  // ------------------------
  // 상태 처리
  // ------------------------

  if (!ready) {
    return <div className="text-sm text-[var(--text-sub)]">세션 확인중…</div>;
  }

  if (loading) {
    return <div className="text-sm text-[var(--text-sub)]">Loading…</div>;
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <Button variant="soft" onClick={() => nav(-1)}>
          뒤로
        </Button>
        <div className="text-sm text-[var(--text-sub)]">
          존재하지 않는 문의입니다.
        </div>
      </div>
    );
  }

  // ------------------------
  // 본문
  // ------------------------

  return (
    <div className="space-y-6">
      {/* 상단 영역 */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="soft" onClick={() => nav("/support")}>
          목록
        </Button>

        <TagChip variant="display" size="sm" active>
          {item.status}
        </TagChip>
      </div>

      {/* 제목 + 작성자 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-200">
          {item.title || "(제목 없음)"}
        </h1>

        <div className="text-xs text-zinc-200">
          {item.nickname} · {new Date(item.created_at).toLocaleString()}
        </div>
      </div>

      {/* 본문 */}
      <Surface>
        <pre className="whitespace-pre-wrap break-words text-sm  text-zinc-200 leading-relaxed">
          {item.body}
        </pre>
      </Surface>

      {/* 수정 / 삭제 */}
      {isMine && (
        <div className="flex gap-2">
          <Button
            variant="soft"
            onClick={() => nav(`/support/${item.id}/edit`)}
          >
            수정
          </Button>

          <Button variant="danger" onClick={remove} disabled={busy}>
            삭제
          </Button>
        </div>
      )}
    </div>
  );
}
