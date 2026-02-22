import { supabase } from "@/lib/supabaseClient";
import { TABLE_BASE } from "@/features/shiori/repo/shioriRepo";

/** ---- Legacy Source Types ---- */
export type LegacyStudyLog = {
  id?: string | number; // old local id
  _id?: string; // mongo _id
  legacyId?: string | number; // old timestamp id (ms) or any stable id
  category?: string; // japanese/coding/other
  title?: string;
  content?: string;
  date?: string; // ISO string (original created date)
};

export type LegacyExportObject =
  | LegacyStudyLog[]
  | { version?: number; exportedAt?: string; logs?: LegacyStudyLog[] };

/** ---- Options / Result ---- */
export type ImportOptions = {
  defaultTags?: string[];
  categoryToTag?: boolean;
  chunkSize?: number; // default 100
  dryRun?: boolean;
  sourceId?: string; // e.g. "jp-dev-study-log-next"
};

export type ImportResult = {
  total: number;
  upserted: number; // 성공적으로 upsert된 수(대략)
  skipped: number;
  errors: { index: number; message: string }[];
};

export type ExportOptions = {
  from?: "base" | "view";
  includeDeleted?: boolean; // base에서만 의미
  limit?: number; // default 5000
};

function asArray(input: LegacyExportObject): LegacyStudyLog[] {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray((input as any).logs)) return (input as any).logs;
  return [];
}

function normalizeTag(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

function uniq(arr: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    const k = normalizeTag(x);
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

function mapCategoryToTag(cat?: string) {
  const c = normalizeTag(cat);
  if (!c) return null;
  if (c === "japanese") return "japanese";
  if (c === "coding") return "coding";
  return "other";
}

function toIsoOrNull(v: unknown): string | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function legacyIdToIsoOrNull(legacyId: unknown): string | null {
  if (legacyId === null || legacyId === undefined) return null;
  const n = Number(legacyId);
  if (!Number.isFinite(n)) return null;
  const d = new Date(n);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function getAuthedUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data?.user?.id;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

/**
 * ✅ Legacy 1건 → shiori_items upsert row
 *
 * 전략(너가 선택한 2번):
 * - created_at: DB 기본값(now) 유지 (즉, import 시점)
 * - source_date: 원본 date(과거 작성일) 저장
 * - legacy_id: upsert key (가능하면 반드시 넣기)
 */
function mapLegacyToUpsertRow(
  it: LegacyStudyLog,
  userId: string,
  options: ImportOptions,
) {
  const title = String(it.title ?? "").trim();
  const content = String(it.content ?? "").trim();

  // 정책(원하면 더 빡세게 가능): 빈 글은 스킵
  if (!title || !content) return null;

  // 원본 작성일(가능하면 date 우선, 없으면 legacyId(ms)에서 추정)
  const sourceDate =
    toIsoOrNull(it.date) ?? legacyIdToIsoOrNull(it.legacyId) ?? null;

  // upsert용 legacy_id
  const legacy_id =
    it.legacyId != null
      ? String(it.legacyId)
      : it._id != null
        ? String(it._id)
        : it.id != null
          ? String(it.id)
          : null;

  if (!legacy_id) return null; // ✅ upsert 안정성을 위해 legacy_id 없으면 스킵(권장)

  let tags: string[] = [];
  if (options.defaultTags?.length) tags.push(...options.defaultTags);

  if (options.categoryToTag) {
    const t = mapCategoryToTag(it.category);
    if (t) tags.push(t);
  }

  tags = uniq(tags).slice(0, 10);

  // created_at은 일부러 안 넣음 → DB가 now() 기본값을 쓰게 함
  // (이미 created_at 컬럼이 NOT NULL이라면 기본값이 있어야 함)
  return {
    user_id: userId,
    title,
    content,
    tags,
    legacy_id,
    source_id: options.sourceId ?? null,
    source_date: sourceDate, // ✅ 화면에서 보여줄 “원본 작성일”
  };
}

/** ✅ Import (Upsert) */
export async function importLegacyLogsUpsert(
  input: LegacyExportObject,
  options: ImportOptions = {},
): Promise<ImportResult> {
  const logs = asArray(input);
  const userId = await getAuthedUserId();

  const chunkSize = options.chunkSize ?? 100;

  const rows: any[] = [];
  let skipped = 0;

  for (const it of logs) {
    const row = mapLegacyToUpsertRow(it, userId, options);
    if (!row) {
      skipped++;
      continue;
    }
    rows.push(row);
  }

  if (options.dryRun) {
    return { total: logs.length, upserted: 0, skipped, errors: [] };
  }

  const errors: { index: number; message: string }[] = [];
  let upserted = 0;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const part = rows.slice(i, i + chunkSize);

    const { data, error } = await supabase
      .from(TABLE_BASE)
      .upsert(part, { onConflict: "legacy_id" })
      .select("id, legacy_id");

    if (error) {
      errors.push({ index: i, message: error.message });
      continue;
    }

    upserted += (data ?? []).length;
  }

  return { total: logs.length, upserted, skipped, errors };
}

/** ✅ Export (내 글만) */
export async function exportMyLogs(options: ExportOptions = {}) {
  const from = options.from ?? "view";
  const limit = options.limit ?? 5000;

  const table = from === "view" ? "shiori_items_v" : TABLE_BASE;

  // view에는 is_deleted가 없을 수 있음. base는 있음.
  let q = supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (from === "base" && !options.includeDeleted) {
    q = q.eq("is_deleted", false as any);
  }

  const { data, error } = await q;
  if (error) throw error;

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    source: from,
    count: (data ?? []).length,
    logs: data ?? [],
  };
}
