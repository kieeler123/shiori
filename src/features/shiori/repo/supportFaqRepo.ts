import { supabase } from "@/lib/supabaseClient";

const FAQ_TABLE = "support_faq";

export type SupportFaqRow = {
  id: string;
  locale: string;
  title: string;
  body: string;
  tags: string[] | null;
  category: string | null;
  sort_order: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

const SELECT =
  "id,locale,title,body,tags,category,sort_order,is_published,created_at,updated_at";

export async function dbFaqList(locale: string): Promise<SupportFaqRow[]> {
  const { data, error } = await supabase
    .from(FAQ_TABLE)
    .select(SELECT)
    .eq("locale", locale)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false }); // sort_order null 대비

  if (error) throw error;
  return (data ?? []) as SupportFaqRow[];
}
