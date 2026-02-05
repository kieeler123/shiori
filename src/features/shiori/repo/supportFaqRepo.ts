import { supabase } from "@/lib/supabaseClient";

const TABLE = "support_faq";

// 목록용 타입
export type SupportFaqRow = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  sort_order: number;
  updated_at: string;
};

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
