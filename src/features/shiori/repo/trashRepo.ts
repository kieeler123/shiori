import { supabase } from "@/lib/supabaseClient";
import { logError } from "@/shared/error/logError";
import type { AttachmentItem, TrashListRow } from "../type";
import { deleteAttachment } from "@/features/attachments/lib/deleteAttachment";

const LOGS_TABLE = "shiori_items";
const LOGS_TRASH_VIEW = "shiori_trash_v";

type LogRowForDelete = {
  id: string;
  user_id: string;
  is_deleted: boolean;
  attachments?: AttachmentItem[] | null;
};

async function deleteAttachments(attachments: AttachmentItem[]): Promise<void> {
  for (const attachment of attachments) {
    await deleteAttachment(attachment);
  }
}

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const user = data.user;
  if (!user) throw new Error("Not signed in");

  return user.id;
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

  // 2) 첨부파일부터 삭제
  if (attachments.length > 0) {
    try {
      await deleteAttachments(attachments);
    } catch (error) {
      await logError({
        category: "storage",
        action: "trash-hard-delete-log-attachments",
        page:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        error,
        meta: {
          id,
          userId: uid,
          attachmentCount: attachments.length,
        },
      });

      // 첨부파일 삭제에 실패하면 DB row는 남긴다.
      throw error;
    }
  }

  // 3) 첨부파일 삭제가 성공한 경우 DB row 삭제
  const { data: deletedRows, error: deleteError } = await supabase
    .from(LOGS_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", uid)
    .eq("is_deleted", true)
    .select("id");

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

  if (!deletedRows?.length) {
    const err = new Error("No rows deleted (조건 불일치 or RLS)");

    await logError({
      category: "db",
      action: "trash-hard-delete-log-empty",
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
