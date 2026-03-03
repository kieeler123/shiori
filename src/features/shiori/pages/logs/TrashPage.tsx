import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { Button } from "@/shared/ui/primitives/Button";
import { PageSection } from "@/app/layout/PageSection";
import { previewText } from "../../utils/previewOneLine";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import {
  dbLogsTrashHardDelete,
  dbLogsTrashListMine,
  dbLogsTrashRestore,
} from "../../repo/trashRepo";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { formatDateTime } from "@/shared/i18n/format";
import { dbGetMyDeleteStatus } from "@/features/shiori/repo/AccountTrashRepo";

export default function TrashPage() {
  const { isAuthed } = useSession();
  const nav = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const [_deleteStatus, setDeleteStatus] = useState<{
    is_deleted: boolean;
    deleted_at: string | null;
    purge_at: string | null;
  } | null>(null);

  const { t, locale } = useI18n();

  useEffect(() => {
    if (!isAuthed) return;
    dbGetMyDeleteStatus().then(setDeleteStatus).catch(console.error);
  }, [isAuthed]);

  async function load() {
    if (!isAuthed) return;
    const data = await dbLogsTrashListMine();
    setItems(data ?? []);
  }

  useEffect(() => {
    load();
  }, [isAuthed]);

  async function restore(id: string) {
    setBusy(true);
    await dbLogsTrashRestore(id);
    await load();
    setBusy(false);
  }

  async function hardDelete(id: string) {
    if (!confirm(t("logs.trash.confirmHardDelete"))) return;
    setBusy(true);
    await dbLogsTrashHardDelete(id);
    await load();
    setBusy(false);
  }

  if (!isAuthed)
    return <div className="p-6 text-sm t5">{t("common.loginRequired")}</div>;

  return (
    <PageSection>
      <h1 className="mb-6 text-xl font-semibold">🗑 {t("logs.trash.title")}</h1>

      {items.length === 0 ? (
        <div className="text-sm t5">{t("logs.trash.empty")}</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <SurfaceCard
              key={it.id}
              className="space-y-2 text-left rounded-2xl p-4"
            >
              <div className="font-medium">
                {it.title || t("common.noTitle")}
              </div>

              {/* ✅ 1줄 미리보기(원하면 content 매핑해서 넣어) */}
              {it.content ? (
                <div className="mt-1 truncate text-xs t4 line-clamp-1">
                  {previewText(it.content)}
                </div>
              ) : null}

              <div className="text-xs t5 mt-1">
                {formatDateTime(it.deleted_at, locale)}
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  variant="soft"
                  onClick={() => restore(it.id)}
                  disabled={busy}
                >
                  {t("logs.trash.restore")}
                </Button>

                <Button
                  variant="danger"
                  onClick={() => hardDelete(it.id)}
                  disabled={busy}
                >
                  {t("logs.trash.hardDelete")}
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}

      <Button variant="nav" onClick={() => nav(-1)} className="mt-6">
        {t("common.back")}
      </Button>
    </PageSection>
  );
}
