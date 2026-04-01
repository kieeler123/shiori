import { supabase } from "@/lib/supabaseClient";
import { logError } from "@/shared/error/logError";
import type { AttachmentItem, TrashListRow } from "../type";

const LOGS_TABLE = "shiori_items";
const LOGS_TRASH_VIEW = "shiori_trash_v";

type LogRowForDelete = {
  id: string;
  user_id: string;
  is_deleted: boolean;
  attachments?: AttachmentItem[] | null;
};

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const user = data.user;
  if (!user) throw new Error("Not signed in");

  return user.id;
}

function groupAttachmentPathsByBucket(
  attachments: AttachmentItem[] | null | undefined,
): Map<string, string[]> {
  const byBucket = new Map<string, string[]>();

  if (!attachments?.length) return byBucket;

  for (const item of attachments) {
    if (!item?.bucket || !item?.path) continue;

    const prev = byBucket.get(item.bucket) ?? [];
    prev.push(item.path);
    byBucket.set(item.bucket, prev);
  }

  return byBucket;
}

async function deleteAttachmentsFromStorage(
  attachments: AttachmentItem[] | null | undefined,
) {
  const grouped = groupAttachmentPathsByBucket(attachments);

  if (grouped.size === 0) return;

  for (const [bucket, paths] of grouped.entries()) {
    const uniquePaths = [...new Set(paths)];

    const { error } = await supabase.storage.from(bucket).remove(uniquePaths);

    if (error) {
      await logError({
        category: "storage",
        action: "delete-attachments",
        page:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        error,
        meta: {
          bucket,
          paths: uniquePaths,
        },
      });

      throw error;
    }
  }
}

/** ✅ (Logs) 휴지통으로 이동 = soft delete */
export async function dbLogsTrashMove(id: string): Promise<void> {
  const uid = await requireUserId();

  const { error } = await supabase
    .from(LOGS_TABLE)
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: uid,
    })
    .eq("id", id)
    .eq("user_id", uid);

  if (error) {
    await logError({
      category: "db",
      action: "trash-move-log",
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      error,
      meta: {
        id,
        userId: uid,
      },
    });

    throw error;
  }
}

/** ✅ (Logs) 내 휴지통 목록 */
export async function dbLogsTrashListMine(): Promise<TrashListRow[]> {
  const uid = await requireUserId();

  const { data, error } = await supabase
    .from(LOGS_TRASH_VIEW)
    .select("id,title,content,deleted_at,deleted_by")
    .eq("user_id", uid)
    .order("deleted_at", { ascending: false });

  if (error) {
    await logError({
      category: "db",
      action: "trash-list-logs",
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      error,
      meta: {
        userId: uid,
      },
    });

    throw error;
  }

  return (data ?? []) as TrashListRow[];
}

/** ✅ (Logs) 휴지통에서 복구 */
export async function dbLogsTrashRestore(id: string): Promise<void> {
  const uid = await requireUserId();

  const { data, error } = await supabase
    .from(LOGS_TABLE)
    .update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id)
    .eq("user_id", uid)
    .eq("is_deleted", true)
    .select("id");

  if (error) {
    await logError({
      category: "db",
      action: "trash-restore-log",
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      error,
      meta: {
        id,
        userId: uid,
      },
    });

    throw error;
  }

  if (!data?.length) {
    const err = new Error("No rows restored (조건 불일치 or RLS)");

    await logError({
      category: "db",
      action: "trash-restore-log-empty",
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      error: err,
      meta: {
        id,
        userId: uid,
      },
    });

    throw err;
  }
}

/** ✅ (Logs) 완전 삭제 + 첨부파일 삭제 */
export async function dbLogsTrashHardDelete(id: string): Promise<void> {
  const uid = await requireUserId();

  // 1) 먼저 row 조회해서 attachments 확보
  const { data: row, error: getError } = await supabase
    .from(LOGS_TABLE)
    .select("id, user_id, is_deleted, attachments")
    .eq("id", id)
    .eq("user_id", uid)
    .maybeSingle<LogRowForDelete>();

  if (getError) {
    await logError({
      category: "db",
      action: "trash-hard-delete-read-log",
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      error: getError,
      meta: {
        id,
        userId: uid,
      },
    });

    throw getError;
  }

  if (!row) {
    const err = new Error("Log not found for hard delete");

    await logError({
      category: "db",
      action: "trash-hard-delete-log-not-found",
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      error: err,
      meta: {
        id,
        userId: uid,
      },
    });

    throw err;
  }

  if (!row.is_deleted) {
    const err = new Error("Cannot hard delete a non-trashed log");

    await logError({
      category: "db",
      action: "trash-hard-delete-non-trashed-log",
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      error: err,
      meta: {
        id,
        userId: uid,
      },
    });

    throw err;
  }

  const attachments = (row.attachments ?? []) as AttachmentItem[];

  // 2) DB row 삭제
  const { error: deleteError } = await supabase
    .from(LOGS_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", uid)
    .eq("is_deleted", true);

  if (deleteError) {
    await logError({
      category: "db",
      action: "trash-hard-delete-log",
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      error: deleteError,
      meta: {
        id,
        userId: uid,
        attachmentCount: attachments.length,
      },
    });

    throw deleteError;
  }

  // 3) 첨부파일 삭제
  if (attachments.length > 0) {
    try {
      await deleteAttachmentsFromStorage(attachments);
    } catch (e) {
      // 글은 이미 삭제되었고, 첨부만 실패한 상태
      // 이건 로그를 남기고 에러를 다시 던질지 말지 정책 선택 가능
      // 지금은 사용자도 알 수 있게 throw 유지
      await logError({
        category: "storage",
        action: "trash-hard-delete-log-attachments-cleanup",
        page:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        error: e,
        meta: {
          id,
          userId: uid,
          attachmentCount: attachments.length,
          attachments,
        },
      });

      throw e;
    }
  }
}

/** ✅ (Logs) 내 글 전체 soft delete */
export async function dbLogsSoftDeleteAllMine(): Promise<void> {
  const uid = await requireUserId();

  const { error } = await supabase
    .from(LOGS_TABLE)
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: uid,
    })
    .eq("user_id", uid)
    .eq("is_deleted", false);

  if (error) {
    await logError({
      category: "db",
      action: "soft-delete-all-logs",
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      error,
      meta: {
        userId: uid,
      },
    });

    throw error;
  }
}
