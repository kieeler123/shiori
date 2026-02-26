import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import { dbSupportGet } from "@/features/shiori/repo/supportRepo";

import type { SupportTicketDetailRow } from "../../type";
import { isUuid } from "@/features/shiori/utils/isUuid";
import RouteProblem from "@/features/shiori/components/RouteProblem";

import { Button } from "@/shared/ui/primitives/Button";
import TagChip from "@/shared/ui/primitives/TagChip";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { formatDateTime } from "@/shared/i18n/format";

import { dbSupportTrashMove } from "../../repo/supportTrashRepo";

export default function SupportDetailPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { ready, isAuthed, userId } = useSession();
  const { t, locale } = useI18n();

  const [item, setItem] = useState<SupportTicketDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // ✅ UUID 체크
  if (!isUuid(id)) {
    return (
      <RouteProblem
        title={t("common.route.invalidTitle")}
        message={t("support.detail.invalidId")}
        hint={t("support.detail.invalidHint", { id: String(id) })}
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

  // ✅ 삭제(휴지통 이동)
  async function remove() {
    if (!isMine) return;
    if (!confirm(t("support.detail.confirmMoveToTrash"))) return;

    setBusy(true);
    try {
      await dbSupportTrashMove(id!);
      nav("/support", { state: { refresh: true } });
    } finally {
      setBusy(false);
    }
  }

  // ------------------------
  // 상태 처리
  // ------------------------

  if (!ready) {
    return <LoadingText label={t("common.sessionChecking")} />;
  }

  if (loading) {
    return <LoadingText label={t("common.loading")} />;
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <Button variant="soft" onClick={() => nav(-1)}>
          {t("common.back")}
        </Button>
        <div className="text-sm text-[var(--text-sub)]">
          {t("support.detail.notFound")}
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
          {t("common.list")}
        </Button>

        <TagChip variant="display" size="sm" active>
          {t(`support.status.${item.status}`)}
        </TagChip>
      </div>

      {/* 제목 + 작성자 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight t1">
          {item.title || t("common.noTitle")}
        </h1>

        <div className="text-xs t3">
          {item.nickname} · {formatDateTime(item.created_at, locale)}
        </div>
      </div>

      {/* 본문(원문 그대로) */}
      <SurfaceCard>
        <pre className="whitespace-pre-wrap break-words text-sm t2 leading-relaxed">
          {item.body}
        </pre>
      </SurfaceCard>

      {/* 수정 / 삭제 (내 글만) */}
      {isMine ? (
        <div className="flex gap-2">
          <Button
            variant="soft"
            onClick={() => nav(`/support/${item.id}/edit`)}
          >
            {t("common.edit")}
          </Button>

          <Button variant="danger" onClick={remove} disabled={busy}>
            {t("common.delete")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
