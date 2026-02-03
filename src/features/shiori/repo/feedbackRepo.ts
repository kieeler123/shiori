import { supabase } from "@/lib/supabaseClient";

const TABLE = "shiori_feedback";

export type FeedbackType = "bug" | "ux" | "feature";

export type DbFeedbackRow = {
  id: string;
  user_id: string | null;
  type: FeedbackType;
  title: string | null;
  body: string;
  page_url: string | null;
  user_agent: string | null;
  created_at: string;
};

export async function dbFeedbackCreate(input: {
  type: FeedbackType;
  title?: string;
  body: string;
  pageUrl?: string;
}): Promise<void> {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : undefined;

  const { error } = await supabase.from(TABLE).insert({
    type: input.type,
    title: input.title?.trim() || null,
    body: input.body.trim(),
    page_url: input.pageUrl || null,
    user_agent: ua || null,
  });

  if (error) throw error;
}

export async function dbFeedbackList(limit = 50): Promise<DbFeedbackRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,user_id,type,title,body,page_url,user_agent,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as DbFeedbackRow[];
}

export async function dbFeedbackDelete(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
