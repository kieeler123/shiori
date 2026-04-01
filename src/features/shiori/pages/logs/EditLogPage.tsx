import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import { dbGet, dbUpdate } from "@/features/shiori/repo/shioriRepo";
import LogEditor from "@/features/shiori/components/LogEditor";
import type {
  AttachmentItem,
  DbLogRow,
  LinkPreviewItem,
  TableData,
} from "../../type";

import { Button } from "@/shared/ui/primitives/Button";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { PageSection } from "@/app/layout/PageSection";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { formatDateTime } from "@/shared/i18n/format";
// 있으면 사용 (없으면 아래 주석 참고)
// import { PageLoadingCard } from "@/shared/ui/patterns/PageLoadingCard";

type EditorSubmitValue = {
  title: string;
  content: string;
  tags: string[];
  table_data?: TableData | null;
  attachments?: AttachmentItem[];
  links?: LinkPreviewItem[];
};

export default function EditLogPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthed, userId } = useSession();

  const [item, setItem] = useState<DbLogRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const { t, locale } = useI18n();

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
      const updated = await dbUpdate(id, {
        title: v.title,
        content: v.content,
        tags: v.tags,
        table_data: v.table_data ?? null,
        attachments: v.attachments ?? [],
        links: v.links ?? [],
      });

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
    return <LoadingText label={t("logs.edit.loading")} />;
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="soft" onClick={() => nav(-1)}>
            ← {t("common.back")}
          </Button>
        </div>

        <SurfaceCard className="p-4">
          <div className="text-sm t5">{t("logs.edit.notFound")}</div>
        </SurfaceCard>
      </div>
    );
  }

  if (!isAuthed || !isMine) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="soft" onClick={() => nav(`/logs/${item.id}`)}>
            {t("common.viewDetail")}
          </Button>

          <div className="text-sm t5">{t("logs.edit.forbidden")}</div>
        </div>

        <SurfaceCard className="p-4">
          <Button variant="soft" onClick={() => nav(`/logs/${item.id}`)}>
            {t("common.viewDetail")}
          </Button>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <PageSection>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="text-xs t5">
          <div className="text-xs t5">
            {formatDateTime(item.created_at, locale)}
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight t2">
          {t("logs.edit.title")}
        </h1>
      </div>

      <div className="mt-6">
        <LogEditor
          key={item.id}
          syncKey={item.id}
          initialTitle={item.title}
          initialContent={item.content}
          initialTags={Array.isArray(item.tags) ? item.tags : []}
          initialTableData={item.table_data ?? null}
          initialAttachments={item?.attachments ?? []}
          initialLinks={item?.links ?? []}
          submitLabel={busy ? t("common.processing") : t("logs.edit.save")}
          onCancel={() => nav(`/logs/${item.id}`)}
          onSubmit={onSubmit}
        />
      </div>
    </PageSection>
  );
}
