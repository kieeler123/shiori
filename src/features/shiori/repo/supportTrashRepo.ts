import { supabase } from "@/lib/supabaseClient";

const SUPPORT_TABLE = "support_tickets";
const SUPPORT_TRASH_VIEW = "support_trash_v";

export type SupportTrashListRow = {
  id: string;
  title: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
};

export async function dbSupportSoftDelete(id: string): Promise<void> {
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
    .eq("id", id);

  if (error) throw error;
}

export async function dbSupportMyTrashList(): Promise<SupportTrashListRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  // ✅ 관리자 닉네임 컬럼은 나중에. 우선 확실히 있는 컬럼만.
  const { data, error } = await supabase
    .from(SUPPORT_TRASH_VIEW)
    .select("id,title,deleted_at,deleted_by")
    .eq("deleted_by", user.id)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any;
}
