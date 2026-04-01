import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";

import { dbGet } from "@/features/shiori/repo/shioriRepo";
import {
  dbCommentsList,
  dbCommentCreate,
  dbCommentDelete,
} from "@/features/shiori/repo/commentsRepo";

import { supabase } from "@/lib/supabaseClient";

import RouteProblem from "@/features/shiori/components/RouteProblem";
import { isUuid } from "@/features/shiori/utils/isUuid";
import type { DbCommentRow } from "../../type";
import { Button } from "@/shared/ui/primitives/Button";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { Textarea } from "@/shared/ui/primitives/Textarea";
import { LogMetaInline } from "../../components/LogMetaInline";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { dbLogsTrashMove } from "../../repo/trashRepo";
import { toast } from "@/app/layout/toast";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import LogsSection from "../../components/logs/LogsSection";
import LogContentRenderer from "../../components/logs/LogContentRenderer";
import { toastError } from "@/shared/error/toastError";

function chip(t: string) {
  return (
    <span
      key={t}
      className="select-none rounded-full border border-[color:var(--border-soft)] px-2 py-1 text-xs text-[var(--text-5)]"
    >
      #{t}
    </span>
  );
}

export default function LogDetailPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthed, userId } = useSession();

  const { t } = useI18n();

  // ✅ Guard: uuid 아니면 조회하지 않고 안내
  if (!isUuid(id)) {
    return (
      <RouteProblem
        title={t("route.invalidTitle")}
        message={t("route.invalidLogId")}
        hint={t("route.invalidHint", { id: String(id) })}
      />
    );
  }

  const [item, setItem] = useState<Awaited<ReturnType<typeof dbGet>>>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [comments, setComments] = useState<DbCommentRow[]>([]);
  const [commentText, setCommentText] = useState("");

  const isMine = useMemo(() => {
    if (!isAuthed || !userId) return false;
    return item?.user_id === userId;
  }, [isAuthed, userId, item?.user_id]);

  // ✅ 상세 + 댓글 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const row = await dbGet(id);
        setItem(row);

        const cs = await dbCommentsList(id);
        setComments(cs);
      } finally {
        setLoading(false);
      }
    })().catch(console.error);
  }, [id]);

  useEffect(() => {
    if (item) {
      console.log("log item", item);
      console.log("table_data", (item as any).table_data);
    }
  }, [item]);

  // ✅ 조회수 +1 (10분 쿨다운)
  useEffect(() => {
    const KEY = `shiori:viewed:${id}`;
    const COOL_MS = 10 * 60 * 1000;

    const last = Number(localStorage.getItem(KEY) ?? "0");
    const now = Date.now();

    if (last && now - last < COOL_MS) return;

    localStorage.setItem(KEY, String(now));

    (async () => {
      const { error } = await supabase.rpc("increment_view_count", {
        item_id: id,
      });
      if (error) console.error(error);

      setItem((cur) =>
        cur ? { ...cur, view_count: ((cur as any).view_count ?? 0) + 1 } : cur,
      );
    })().catch(console.error);
  }, [id]);

  async function refreshComments() {
    const cs = await dbCommentsList(id!);
    setComments(cs);
  }

  async function submitComment() {
    if (!isAuthed) return;

    const body = commentText.trim();
    if (!body) return;

    setBusy(true);
    try {
      await dbCommentCreate({ item_id: id!, body });
      setCommentText("");
      await refreshComments();
      toast(t("common.comments.created"), "success");
    } catch (e: any) {
      console.error(e);
      toast(String(e?.message ?? e), "error");
      await toastError({
        category: "db",
        action: "create-comment",
        page: window.location.pathname,
        uiMessage: t("errors.storage.uploadFailed"),
        error: e,
        meta: {
          itemId: id,
        },
      });
      throw e;
    } finally {
      setBusy(false);
    }
  }

  async function deleteComment(cid: string) {
    if (!isAuthed) return;

    setBusy(true);
    try {
      await dbCommentDelete(cid);
      await refreshComments();
      toast(t("logs.comments.deleted"), "success");
    } catch (e: any) {
      console.error(e);
      await toastError({
        error: e,
        category: "db",
        action: "delete-comment",
        page: window.location.pathname,
        uiMessage: t("errors.storage.uploadFailed"),
        meta: {
          itemId: id,
          commentId: cid,
        },
      });
    } finally {
      setBusy(false);
    }
  }

  async function removeItem() {
    if (!isAuthed || !isMine) return;
    if (!confirm(t("common.confirmDelete"))) return;

    setBusy(true);
    try {
      await dbLogsTrashMove(id!);
      toast(t("logs.detail.movedToTrash"), "success");
      nav("/logs", { state: { refresh: true } });
    } catch (e: any) {
      console.error(e);
      await toastError({
        error: e,
        category: "db",
        action: "move-log-to-trash",
        page: window.location.pathname,
        uiMessage: t("errors.storage.uploadFailed"),
        meta: {
          itemId: id,
        },
      });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoadingText label={t("common.loading")} />;
  }

  if (!item) {
    return (
      <>
        <Button onClick={() => nav(-1)}>{t("common.back")}</Button>
        <div className="mt-6 text-sm t5">{t("logs.detail.notFound")}</div>
      </>
    );
  }

  const createdLabel = new Date(item.created_at).toLocaleString();
  const viewCount = (item as any).view_count ?? 0;

  return (
    <>
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button
            variant="soft"
            onClick={() => nav("/logs", { state: { refresh: true } })}
          >
            {t("common.list")}
          </Button>

          <LogMetaInline createdLabel={createdLabel} viewCount={viewCount} />
        </div>

        {/* Title + actions */}
        <SurfaceCard className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight t2">
            {item.title || "(제목 없음)"}
          </h1>

          {isMine ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="soft"
                onClick={() => nav(`/logs/${item.id}/edit`)}
              >
                {t("common.edit")}
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={removeItem}
                disabled={busy}
              >
                {t("common.delete")}
              </Button>
            </div>
          ) : null}
        </SurfaceCard>

        {/* Tags */}
        {Array.isArray(item.tags) && item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">{item.tags.map(chip)}</div>
        ) : null}

        {/* Content */}
        <SurfaceCard tone="soft" className="mt-5 p-5">
          <LogContentRenderer
            content={item.content ?? ""}
            tableData={item.table_data ?? null}
            attachments={(item as any).attachments ?? []}
            links={(item as any).links ?? []}
          />
        </SurfaceCard>

        {item ? (
          <SurfaceCard tone="soft" className="mt-5 p-5">
            <LogsSection
              currentLogId={item.id}
              userId={item.user_id}
              limit={5}
            />
          </SurfaceCard>
        ) : null}

        {/* Comments */}
        <div className="mt-10">
          <div className="mb-3 text-sm t4">
            {t("common.comments.title")}{" "}
            <span className="t6">({comments.length})</span>
          </div>

          {!isAuthed ? (
            <div className="mb-4">
              <AuthPanel />
            </div>
          ) : (
            <SurfaceCard tone="soft" className="mb-4">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder={t("common.comments.ph")}
              />

              <div className="mt-2 flex justify-end">
                <Button
                  variant="soft"
                  onClick={submitComment}
                  disabled={busy || !commentText.trim()}
                >
                  {busy ? t("common.processing") : t("common.comments.submit")}
                </Button>
              </div>
            </SurfaceCard>
          )}

          <div className="space-y-2">
            {comments.map((c) => {
              const mine = isAuthed && userId === c.user_id;

              return (
                <SurfaceCard key={c.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs t6">
                      {new Date(c.created_at).toLocaleString()}
                      {mine ? (
                        <span className="ml-2 t5">
                          ({t("common.comments.mine")})
                        </span>
                      ) : null}
                    </div>

                    {mine ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteComment(c.id)}
                        disabled={busy}
                        className="h-7 px-2 text-xs"
                      >
                        {t("common.delete")}
                      </Button>
                    ) : null}
                  </div>

                  <div className="mt-2 whitespace-pre-wrap break-words text-sm t4 leading-relaxed">
                    {c.body}
                  </div>
                </SurfaceCard>
              );
            })}

            {comments.length === 0 ? (
              <div className="text-sm t5">{t("common.comments.empty")}</div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
