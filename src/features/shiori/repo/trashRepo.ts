import { supabase } from "@/lib/supabaseClient";
import type { TrashListRow } from "../type"; // 너 타입명에 맞춰 수정

const LOGS_TABLE = "shiori_items"; // 실제 테이블명으로 수정
const LOGS_TRASH_VIEW = "shiori_trash_v"; // 실제 뷰명으로 수정

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
      deleted_by: uid, // 유지해도 OK
    })
    .eq("id", id)
    .eq("user_id", uid); // ✅ owner 기준

  if (error) throw error;
}

/** ✅ (Logs) 내 휴지통 목록 */
export async function dbLogsTrashListMine(): Promise<TrashListRow[]> {
  const uid = await requireUserId();

  const { data, error } = await supabase
    .from(LOGS_TRASH_VIEW)
    .select("id,title,content,deleted_at,deleted_by")
    .eq("user_id", uid) // ✅ 여기!
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TrashListRow[];
}

/** ✅ (Logs) 휴지통에서 복구 */
export async function dbLogsTrashRestore(id: string): Promise<void> {
  const uid = await requireUserId();

  const { data, error } = await supabase
    .from(LOGS_TABLE)
    .update({ is_deleted: false, deleted_at: null, deleted_by: null })
    .eq("id", id)
    .eq("user_id", uid)
    .eq("is_deleted", true)
    .select("id");

  console.log({ error, data });
  if (error) throw error;
  if (!data?.length) throw new Error("No rows restored");

  if (error) throw error;
  if (!data || data.length === 0) {
    // 여기서 원인 파악용 로그 추가하면 디버깅 빨라짐
    throw new Error("No rows restored (조건 불일치 or RLS)");
  }
}

/** ✅ (Logs) 완전 삭제 */
export async function dbLogsTrashHardDelete(id: string): Promise<void> {
  const uid = await requireUserId();

  const { error } = await supabase
    .from(LOGS_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", uid) // ✅ owner 기준
    .eq("is_deleted", true);

  if (error) throw error;
}

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

  if (error) throw error;
}
