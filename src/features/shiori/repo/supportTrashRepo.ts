import { supabase } from "@/lib/supabaseClient";
import type { SupportTrashListRow } from "../type";

const SUPPORT_TABLE = "support_tickets";
const SUPPORT_TRASH_VIEW = "support_trash_v";

/** ✅ 휴지통으로 이동(soft delete) */
export async function dbSupportTrashMove(id: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from(SUPPORT_TABLE)
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

/** ✅ 내 고객센터 휴지통 목록 */
export async function dbSupportTrashListMine(): Promise<SupportTrashListRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  // previewText 쓰면 body 필요 (뷰에 body가 없으면 view를 수정하거나 컬럼 제거)
  const { data, error } = await supabase
    .from(SUPPORT_TRASH_VIEW)
    .select("id,title,body,deleted_at,deleted_by")
    .eq("deleted_by", user.id)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SupportTrashListRow[];
}

/** ✅ 휴지통에서 복구(restore) */
export async function dbSupportTrashRestore(id: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from(SUPPORT_TABLE)
    .update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id)
    .eq("deleted_by", user.id); // ✅ 내 휴지통 것만 복구

  if (error) throw error;
}

/** ✅ 완전 삭제(hard delete) */
export async function dbSupportTrashHardDelete(id: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  // 보안상: "내가 deleted_by로 찍힌 것"만 삭제
  const { error } = await supabase
    .from(SUPPORT_TABLE)
    .delete()
    .eq("id", id)
    .eq("deleted_by", user.id);

  if (error) throw error;
}
