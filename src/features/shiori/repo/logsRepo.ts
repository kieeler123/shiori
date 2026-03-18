import { supabase } from "@/lib/supabaseClient";
import type { LogListItem, LogSort } from "../type";

export async function dbListRecentLogs(params: {
  excludeId?: string;
  limit?: number;
}): Promise<LogListItem[]> {
  const { excludeId, limit = 5 } = params;

  let query = supabase
    .from("shiori_items_v")
    .select("id, title, created_at, view_count, user_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as LogListItem[];
}

export async function dbListRelatedLogs(params: {
  excludeId?: string;
  userId?: string | null;
  limit?: number;
  offset?: number;
  sort?: LogSort;
}): Promise<LogListItem[]> {
  const { excludeId, userId, limit = 5, offset = 0, sort = "recent" } = params;

  if (!userId) return [];

  let query = supabase
    .from("shiori_items_v")
    .select(
      "id, title, content, tags, created_at, display_date, view_count, user_id",
    )
    .eq("user_id", userId);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  query =
    sort === "views"
      ? query
          .order("view_count", { ascending: false, nullsFirst: false })
          .order("display_date", { ascending: false })
      : query.order("display_date", { ascending: false });

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as LogListItem[];
}
