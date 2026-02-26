import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
import type { SupportTrashListRow } from "../../type";

import { Button } from "@/shared/ui/primitives/Button";
import { PageSection } from "@/app/layout/PageSection";
import { previewText } from "../../utils/previewOneLine";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { formatDateTime, formatCount } from "@/shared/i18n/format";

import {
  dbSupportTrashHardDelete,
  dbSupportTrashListMine,
  dbSupportTrashRestore,
} from "../../repo/supportTrashRepo";

export default function SupportTrashPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();
  const { t, locale } = useI18n();

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
    if (busy) return;
    setBusy(true);
    try {
      await dbSupportTrashRestore(id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function hardDelete(id: string) {
    if (busy) return;

    const ok = confirm(t("support.trash.confirmHardDelete"));
    if (!ok) return;

    setBusy(true);
    try {
      await dbSupportTrashHardDelete(id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <LoadingText label={t("common.sessionChecking")} />;

  if (!isAuthed) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight t1">
          {t("support.trash.title")}
        </h2>
        <div className="text-sm t5">{t("support.trash.loginRequired")}</div>
        <AuthPanel />
      </div>
    );
  }

  return (
    <PageSection>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight t1">
          {t("support.trash.title")}
        </h2>

        <div className="flex items-center gap-2">
          <Button variant="soft" onClick={() => nav("/support")}>
            {t("common.list")}
          </Button>

          <Button variant="soft" onClick={load} disabled={loading}>
            {loading ? t("common.loading") : t("common.refreshing")}
          </Button>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs t5">
          {loading
            ? t("common.loading")
            : `${formatCount(rows.length, locale)}${t("support.countUnit")}`}
        </div>
      </div>

      {/* Error */}
      {err ? (
        <SurfaceCard
          tone="soft"
          className="mt-3 border border-[var(--border-soft)]"
        >
          <div className="text-sm t3">{t("common.errorPrefix")}</div>
          <div className="mt-1 text-sm t2 whitespace-pre-wrap break-words">
            {err}
          </div>
        </SurfaceCard>
      ) : null}

      {/* List */}
      <div className="mt-4">
        {loading ? (
          <LoadingText size="sm" label={t("common.loading")} />
        ) : rows.length === 0 ? (
          <EmptyState>{t("support.trash.empty")}</EmptyState>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <SurfaceCard key={r.id} className="space-y-2 text-left p-4">
                <div className="t2">{r.title || t("common.noTitle")}</div>

                {r.body_preview ? (
                  <div className="text-xs t5 line-clamp-1">
                    {previewText(r.body_preview, 200)}
                  </div>
                ) : null}

                <div className="text-xs t5">
                  {t("support.trash.deletedAt")}{" "}
                  {r.deleted_at ? formatDateTime(r.deleted_at, locale) : "-"}
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="soft"
                    onClick={() => restore(r.id)}
                    disabled={busy}
                  >
                    {t("support.trash.restore")}
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => hardDelete(r.id)}
                    disabled={busy}
                  >
                    {t("support.trash.hardDelete")}
                  </Button>
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}
      </div>
    </PageSection>
  );
}
