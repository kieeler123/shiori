import { supabase } from "@/lib/supabaseClient";

export type DbLogRow = {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string | null;
  comment_count: number;
};

const TABLE = "shiori_items";

export async function dbList(): Promise<DbLogRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,user_id,title,content,tags,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbLogRow[];
}

export async function dbGet(id: string): Promise<DbLogRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,user_id,title,content,tags,created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as DbLogRow | null;
}

export async function dbCreate(input: {
  title: string;
  content: string;
  tags: string[];
}): Promise<DbLogRow> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      content: input.content,
      tags: input.tags,
    })
    .select("id,user_id,title,content,tags,created_at")
    .single();

  if (error) throw error;
  return data as DbLogRow;
}

export async function dbUpdate(
  id: string,
  input: { title: string; content: string; tags: string[] },
): Promise<DbLogRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      title: input.title.trim(),
      content: input.content,
      tags: input.tags,
    })
    .eq("id", id)
    .select("id,user_id,title,content,tags,created_at")
    .single();

  if (error) throw error;
  return data as DbLogRow;
}

export async function dbDelete(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

// Undo에서 delete 복구(원본 id 유지)
export async function dbRestore(row: {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string | null;
  comment_count: number;
}): Promise<DbLogRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select("id,user_id,title,content,tags,created_at")
    .single();

  if (error) throw error;
  return data as DbLogRow;
}
