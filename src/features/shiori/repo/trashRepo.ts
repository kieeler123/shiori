import { supabase } from "@/lib/supabaseClient";
import type { DbLogRow } from "./shioriRepo";

const TABLE_BASE = "shiori_items";
const TABLE_TRASH_VIEW = "shiori_trash_v";

const SELECT_TRASH =
  "id,user_id,title,content,tags,created_at,updated_at,comment_count,view_count,deleted_at,deleted_by";

export async function dbSoftDelete(id: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from(TABLE_BASE)
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function dbRestoreItem(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_BASE)
    .update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function dbHardDelete(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_BASE).delete().eq("id", id);
  if (error) throw error;
}

export async function dbMyTrash(): Promise<
  (DbLogRow & {
    deleted_at: string | null;
    deleted_by: string | null;
  })[]
> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from(TABLE_TRASH_VIEW)
    .select(SELECT_TRASH)
    .eq("deleted_by", user.id)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any;
}
