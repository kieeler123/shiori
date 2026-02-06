import { supabase } from "@/lib/supabaseClient";
import type { SupportFaqRow } from "../type";

const TABLE = "support_faq";

const SELECT = "id,title,body,category,sort_order,updated_at";

export async function dbFaqList(): Promise<SupportFaqRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any;
}
