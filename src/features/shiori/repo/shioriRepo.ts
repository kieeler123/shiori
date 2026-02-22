import { supabase } from "@/lib/supabaseClient";
import type { DbLogRow, LogListQuery } from "../type";
import { validateCreate } from "../domain/LogValidator";

type CreateResult =
  | { ok: true; row: DbLogRow }
  | { ok: false; reason: "HIDDEN_BY_VIEW"; createdId: string };

const TABLE_VIEW = "shiori_items_v"; // ✅ 화면은 뷰만 본다
export const TABLE_BASE = "shiori_items"; // ✅ 생성/수정은 원본

const SELECT_BASE =
  "id, user_id, title, content, tags, created_at, updated_at, view_count, comment_count,source_date, profile:profiles!shiori_items_user_id_fkey ( nickname, is_deleted )";

export async function dbListPage(opts: LogListQuery = {}): Promise<DbLogRow[]> {
  const {
    limit = 10,
    offset = 0,
    orderBy = "source_date",
    ascending = false,
  } = opts;

  let q = supabase
    .from(TABLE_VIEW)
    .select(SELECT_BASE)
    .range(offset, offset + limit - 1);

  if (orderBy === "source_date") {
    q = q
      .order("source_date", { ascending, nullsFirst: false })
      .order("created_at", { ascending });
  } else {
    q = q.order("created_at", { ascending });
  }

  const { data, error } = await q;
  if (error) throw error;

  return data ?? [];
}

export async function dbGet(id: string): Promise<DbLogRow | null> {
  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_BASE)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as DbLogRow | null;
}

export async function dbCreate(input: {
  title: string;
  content: string;
  tags: string[];
}): Promise<CreateResult> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  // ✅ 기본 차단 (제목/내용 필수)
  const v = validateCreate(input); // title/content/tags 정리 + 필수 검사

  // dbCreate 내부, insert 전에
  const dup = await supabase
    .from(TABLE_BASE)
    .select("id")
    .eq("user_id", user.id)
    .eq("title", v.title)
    .eq("content", v.content)
    .eq("is_deleted", false)
    .limit(1);

  if ((dup.data?.length ?? 0) > 0) {
    throw new Error("이미 같은 제목/내용의 글이 존재합니다.");
  }

  // ✅ (선택) 중복 차단까지 하려면 아래 2번 참고

  const { data, error } = await supabase
    .from(TABLE_BASE)
    .insert({
      user_id: user.id,
      title: v.title,
      content: v.content,
      tags: v.tags,
    })
    .select("id")
    .single();

  if (error) throw error;

  // ✅ 저장 직후: 뷰에서 다시 조회 (노출 여부 체크)
  const row = await dbGet(data.id); // 뷰에서 확인
  if (!row) return { ok: false, reason: "HIDDEN_BY_VIEW", createdId: data.id };

  return { ok: true, row };
}

export async function dbUpdate(
  id: string,
  input: { title: string; content: string; tags: string[] },
): Promise<DbLogRow> {
  const { error } = await supabase
    .from(TABLE_BASE)
    .update({
      title: input.title.trim(),
      content: input.content,
      tags: input.tags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  const row = await dbGet(id);
  if (!row) throw new Error("Updated row not found in view");
  return row;
}
