import { supabase } from "@/lib/supabaseClient";
import type {
  AttachmentItem,
  DbLogRow,
  LinkPreviewItem,
  LogListQuery,
  TableData,
} from "../type";
import { validateCreate } from "../domain/validators/LogValidator";
import { logError } from "@/shared/error/logError";
import { validateContentBlocks } from "../domain/validators/contentBlocksValidator";

type CreateResult =
  | { ok: true; row: DbLogRow }
  | { ok: false; reason: "HIDDEN_BY_VIEW"; createdId: string };

const TABLE_VIEW = "shiori_items_v";
export const TABLE_BASE = "shiori_items";

const SELECT_LIST =
  "id, user_id, title, content, tags, created_at, updated_at, view_count, comment_count, source_date, display_date, source_filename, import_source, profile:profiles!shiori_items_user_id_fkey ( nickname, is_deleted ), attachments, links";

export const SELECT_DETAIL = `
  id,
  user_id,
  title,
  content,
  tags,
  table_data,
  attachments,
  links,
  source_filename,
  import_source,
  created_at,
  updated_at
`;
export async function dbListPage(opts: LogListQuery = {}): Promise<DbLogRow[]> {
  const {
    limit = 10,
    offset = 0,
    orderBy = "display_date",
    ascending = false,
    userId = null,
  } = opts;

  let q = supabase
    .from(TABLE_VIEW)
    .select(SELECT_LIST)
    .range(offset, offset + limit - 1);

  if (userId != null && userId !== "") {
    q = q.eq("user_id", userId);
  }

  if (orderBy === "display_date") {
    q = q
      .order("display_date", { ascending, nullsFirst: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  } else if (orderBy === "view_count") {
    q = q
      .order("view_count", { ascending })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  } else if (orderBy === "comment_count") {
    q = q
      .order("comment_count", { ascending })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  } else {
    q = q.order("created_at", { ascending }).order("id", { ascending: false });
  }

  const { data, error } = await q;

  console.log("[dbListPage] rows:", data);
  console.log("[dbListPage] opts:", opts);
  if (error) throw error;
  return (data ?? []) as unknown as DbLogRow[];
}

export async function dbGet(id: string): Promise<DbLogRow | null> {
  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_DETAIL)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as DbLogRow | null;
}

export async function dbCreate(input: {
  title: string;
  content: string;
  tags: string[];
  table_data?: TableData | null;
  attachments?: AttachmentItem[];
  links?: LinkPreviewItem[] | null;
  source_filename?: string | null;
  import_source?: "markdown" | null;
}): Promise<CreateResult> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    console.log("[dbCreate] auth user:", user);

    if (!user) throw new Error("Not signed in");

    const v = validateCreate(input);
    console.log("[dbCreate] validated input:", v);
    console.log("[dbCreate] raw table_data:", input.table_data);

    validateContentBlocks({
      content: input.content,
      attachments: input.attachments ?? [],
      links: input.links ?? [],
    });

    const dup = await supabase
      .from(TABLE_BASE)
      .select("id")
      .eq("user_id", user.id)
      .eq("title", v.title)
      .eq("content", v.content)
      .eq("is_deleted", false)
      .limit(1);

    console.log("[dbCreate] dup result:", dup);

    if ((dup.data?.length ?? 0) > 0) {
      const err = new Error("Duplicate log detected");

      // 🔥 로그 남김
      await logError({
        category: "db",
        action: "create-duplicate-log",
        page: window.location.pathname,
        error: err,
        meta: {
          title: v.title,
          contentLength: v.content.length,
          userId: user.id,
        },
      });

      // 🔥 사용자용 메시지는 throw로 전달
      throw new Error("DUPLICATE_LOG");
    }

    const { data, error } = await supabase
      .from(TABLE_BASE)
      .insert({
        user_id: user.id,
        title: v.title,
        content: v.content,
        tags: v.tags,
        table_data: input.table_data ?? null,
        attachments: input.attachments ?? [],
        links: input.links ?? [],
        source_filename: input.source_filename?.normalize("NFC").trim() || null,
        import_source: input.import_source ?? null,
      })
      .select("id")
      .single();

    console.log("[dbCreate] insert data:", data);
    console.log("[dbCreate] insert error:", error);

    if (error) throw error;

    const row = await dbGet(data.id);
    console.log("[dbCreate] dbGet row:", row);
    console.log("[dbCreate] row.attachments:", (row as any)?.attachments);

    if (!row)
      return { ok: false, reason: "HIDDEN_BY_VIEW", createdId: data.id };

    return { ok: true, row };
  } catch (e) {
    await logError({
      category: "db",
      action: "create-log",
      page: window.location.pathname,
      error: e,
      meta: {
        titleLength: input.title.length,
        tagCount: input.tags.length,
        attachmentCount: input.attachments?.length ?? 0,
      },
    });

    throw e;
  }
}

export async function dbUpdate(
  id: string,
  input: {
    title: string;
    content: string;
    tags: string[];
    table_data?: TableData | null;
    attachments?: AttachmentItem[];
    links?: LinkPreviewItem[] | null;
    source_filename?: string | null;
    import_source?: "markdown" | null;
  },
): Promise<DbLogRow> {
  validateContentBlocks({
    content: input.content,
    attachments: input.attachments ?? [],
    links: input.links ?? [],
  });

  try {
    const { error } = await supabase
      .from(TABLE_BASE)
      .update({
        title: input.title.trim(),
        content: input.content,
        tags: input.tags,
        table_data: input.table_data ?? null,
        updated_at: new Date().toISOString(),
        attachments: input.attachments ?? [],
        links: input.links ?? [],
        source_filename: input.source_filename?.normalize("NFC").trim() || null,
        import_source: input.import_source ?? null,
      })
      .eq("id", id);

    if (error) throw error;

    const row = await dbGet(id);
    console.log("[dbUpdate] dbGet row:", row);
    console.log("[dbUpdate] row.attachments:", (row as any)?.attachments);
    if (!row) throw new Error("Updated row not found in view");
    return row;
  } catch (e) {
    await logError({
      category: "db",
      action: "update-log",
      page: window.location.pathname,
      error: e,
      meta: {
        id,
        titleLength: input.title.length,
      },
    });

    throw e;
  }
}

function normalizeSourceFilename(filename: string) {
  let value = filename;

  try {
    value = decodeURIComponent(value);
  } catch {
    // 그대로 사용
  }

  return value.normalize("NFC").trim();
}

export async function dbFindBySourceFilename(
  filename: string,
): Promise<Pick<DbLogRow, "id"> | null> {
  const normalizedFilename = normalizeSourceFilename(filename);

  console.log("[dbFindBySourceFilename]", {
    input: filename,
    normalized: normalizedFilename,
  });

  if (!normalizedFilename) {
    return null;
  }

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE_BASE)
    .select("id, source_filename")
    .eq("user_id", auth.user.id)
    .eq("source_filename", normalizedFilename)
    .eq("is_deleted", false)
    .limit(1)
    .maybeSingle();

  console.log("[dbFindBySourceFilename] result", {
    data,
    error,
  });

  if (error) {
    throw error;
  }

  return data?.id
    ? {
        id: data.id,
      }
    : null;
}
