import { supabase } from "@/lib/supabaseClient";
import type { DbLogRow } from "../type";

const TABLE_VIEW = "shiori_items_v"; // ✅ 화면은 뷰만 본다
const TABLE_BASE = "shiori_items"; // ✅ 생성/수정은 원본

const SELECT_BASE =
  "id,user_id,title,content,tags,created_at,updated_at,comment_count,view_count";

export async function dbList(): Promise<DbLogRow[]> {
  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_BASE)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbLogRow[];
}

export async function dbGet(id: string): Promise<DbLogRow | null> {
  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_BASE)
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
  console.log("create user:", auth.user);
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from(TABLE_BASE)
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      content: input.content,
      tags: input.tags,
    })
    .select(SELECT_BASE)
    .single();

  if (error) throw error;
  return data as DbLogRow;
}

export async function dbUpdate(
  id: string,
  input: { title: string; content: string; tags: string[] },
): Promise<DbLogRow> {
  const { data, error } = await supabase
    .from(TABLE_BASE)
    .update({
      title: input.title.trim(),
      content: input.content,
      tags: input.tags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(SELECT_BASE)
    .single();

  if (error) throw error;
  return data as DbLogRow;
}
