import { supabase } from "@/lib/supabaseClient";

export type DbCommentRow = {
  id: string;
  item_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

const T = "shiori_comments";

export async function dbCommentsList(itemId: string): Promise<DbCommentRow[]> {
  const { data, error } = await supabase
    .from(T)
    .select("id,item_id,user_id,body,created_at")
    .eq("item_id", itemId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbCommentRow[];
}

export async function dbCommentCreate(input: {
  item_id: string;
  body: string;
}): Promise<DbCommentRow> {
  const { data, error } = await supabase
    .from(T)
    .insert({
      item_id: input.item_id,
      body: input.body,
      // user_id는 DB default(auth.uid())
    })
    .select("id,item_id,user_id,body,created_at")
    .single();

  if (error) throw error;
  return data as DbCommentRow;
}

export async function dbCommentDelete(id: string): Promise<void> {
  const { error } = await supabase.from(T).delete().eq("id", id);
  if (error) throw error;
}
