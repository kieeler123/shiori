import { supabase } from "@/lib/supabaseClient";
import type { TrashListRow } from "../type"; // 너 타입명에 맞춰 수정

const LOGS_TABLE = "shiori_items"; // 실제 테이블명으로 수정
const LOGS_TRASH_VIEW = "shiori_trash_v"; // 실제 뷰명으로 수정

/** ✅ (Logs) 휴지통으로 이동 = soft delete */
export async function dbLogsTrashMove(id: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from(LOGS_TABLE)
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

/** ✅ (Logs) 내 휴지통 목록 */
export async function dbLogsTrashListMine(): Promise<TrashListRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from(LOGS_TRASH_VIEW)
    .select("id,title,content,deleted_at,deleted_by")
    .eq("deleted_by", user.id)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TrashListRow[];
}

/** ✅ (Logs) 휴지통에서 복구 */
export async function dbLogsTrashRestore(id: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from(LOGS_TABLE)
    .update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id)
    .eq("deleted_by", user.id);

  if (error) throw error;
}

/** ✅ (Logs) 완전 삭제 */
export async function dbLogsTrashHardDelete(id: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from(LOGS_TABLE)
    .delete()
    .eq("id", id)
    .eq("deleted_by", user.id);

  if (error) throw error;
}
