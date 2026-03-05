import { supabase } from "@/lib/supabaseClient";
import { TABLE_BASE } from "@/features/shiori/repo/shioriRepo"; // 네가 export 해둔 TABLE_BASE 재사용
// TABLE_VIEW는 shioriRepo 내부 const라면 여기에도 동일 문자열로 선언
const TABLE_VIEW = "shiori_items_v";

// 목록용 select (가볍게)
const SELECT_ADMIN = `
  id, user_id, title, created_at, source_date, view_count, comment_count, tags,
  is_deleted, is_hidden, duplicate_of
`;

const SELECT_PUBLIC = `
  id, user_id, title, created_at, source_date, view_count, comment_count, tags,display_date
`;

async function countFromView(): Promise<number> {
  const { count, error } = await supabase
    .from(TABLE_VIEW)
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function countTrash(): Promise<number> {
  const { count, error } = await supabase
    .from(TABLE_BASE)
    .select("id", { count: "exact", head: true })
    .eq("is_deleted", true);
  if (error) throw error;
  return count ?? 0;
}

export async function dbAdminListRaw(opts: {
  limit?: number;
  offset?: number;
  onlyDuplicates?: boolean; // 중복만 보기(선택)
}) {
  const { limit = 50, offset = 0, onlyDuplicates = false } = opts;

  let q = supabase
    .from(TABLE_BASE)
    .select(SELECT_ADMIN)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (onlyDuplicates) {
    q = q.eq("is_hidden", true).not("duplicate_of", "is", null);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function dbAdminListPublic(opts: {
  limit?: number;
  offset?: number;
}) {
  const { limit = 50, offset = 0 } = opts;

  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_PUBLIC)
    .range(offset, offset + limit - 1)
    .order("display_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function dbAdminListHiddenDuplicates(opts: {
  limit?: number;
  offset?: number;
}) {
  const { limit = 50, offset = 0 } = opts;

  const { data, error } = await supabase
    .from(TABLE_BASE)
    .select(SELECT_ADMIN)
    .eq("is_hidden", true)
    .not("duplicate_of", "is", null)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function dbAdminCounts() {
  const raw = await supabase
    .from(TABLE_BASE)
    .select("id", { count: "exact", head: true });
  if (raw.error) throw raw.error;

  const pub = await supabase
    .from(TABLE_VIEW)
    .select("id", { count: "exact", head: true });
  if (pub.error) throw pub.error;

  const hiddenDup = await supabase
    .from(TABLE_BASE)
    .select("id", { count: "exact", head: true })
    .eq("is_hidden", true)
    .not("duplicate_of", "is", null);
  if (hiddenDup.error) throw hiddenDup.error;

  return {
    raw: raw.count ?? 0,
    public: pub.count ?? 0,
    hiddenDuplicates: hiddenDup.count ?? 0,
  };
}

/**
 * ✅ 공개/비공개가 DB에 컬럼으로 없다면:
 * - 일단 total만 보여주고 public/private는 나중에 컬럼 추가 후 붙이는 게 맞음.
 * - 만약 컬럼이 있다면 아래 함수에서 eq 조건만 추가하면 됨.
 */
async function countPublic(): Promise<number> {
  // 예: .eq("is_public", true)
  return countFromView();
}

async function countPrivate(): Promise<number> {
  // 예: .eq("is_public", false) 또는 .eq("visibility", "private")
  return 0;
}

export async function dbAdminOverview() {
  const [total, trash, pub, priv] = await Promise.all([
    countFromView(),
    countTrash(),
    countPublic(),
    countPrivate(),
  ]);

  return {
    logs: { total, public: pub, private: priv, trash },
  };
}

/** 최근 7일 작성량: created_at만 가져와서 프론트에서 집계 */
export async function dbAdminLast7Days(): Promise<
  { day: string; value: number }[]
> {
  const since = new Date();
  since.setDate(since.getDate() - 6); // 오늘 포함 7일

  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select("created_at")
    .gte("created_at", since.toISOString());

  if (error) throw error;

  // YYYY-MM-DD 기준 집계
  const map = new Map<string, number>();
  for (const r of data ?? []) {
    const d = String(r.created_at).slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + 1);
  }

  // 7일 채우기
  const out: { day: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    out.push({ day: key.slice(5), value: map.get(key) ?? 0 }); // "MM-DD"
  }
  return out;
}

/** TopTags: tags만 가져와서 프론트에서 집계 (초기엔 이게 제일 빠름) */
export async function dbAdminTopTags(limit = 10) {
  // rows가 많아지면: tags 통계를 DB view/RPC로 빼는 게 더 좋음.
  const { data, error } = await supabase.from(TABLE_VIEW).select("tags");

  if (error) throw error;

  const map = new Map<string, number>();
  for (const r of data ?? []) {
    const raw = (r as any).tags ?? [];
    const arr = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
        ? raw
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [];
    for (const t of arr) map.set(t, (map.get(t) ?? 0) + 1);
  }

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export async function dbAdminListTrash(opts: {
  limit?: number;
  offset?: number;
}) {
  const { limit = 50, offset = 0 } = opts;

  const { data, error } = await supabase
    .from(TABLE_BASE)
    .select(SELECT_ADMIN)
    .eq("is_deleted", true)
    .range(offset, offset + limit - 1)
    .order("deleted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
