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

import { ApiError, apiGet, apiPatch } from "@/lib/apiClient";

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

  const useLocalApi =
    import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_API === "true";

  // 로컬 개발 환경에서 Fastify API 사용
  if (useLocalApi) {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      orderBy,
      ascending: String(ascending),
    });

    if (userId != null && userId !== "") {
      params.set("userId", userId);
    }

    return apiGet<DbLogRow[]>(`/api/logs?${params.toString()}`);
  }

  // 기존 Supabase 조회 방식 유지
  let q = supabase
    .from(TABLE_VIEW)
    .select(SELECT_LIST)
    .range(offset, offset + limit - 1);

  if (userId != null && userId !== "") {
    q = q.eq("user_id", userId);
  }

  if (orderBy === "display_date") {
    q = q
      .order("display_date", {
        ascending,
        nullsFirst: false,
      })
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

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as DbLogRow[];
}

export async function dbGet(id: string): Promise<DbLogRow | null> {
  try {
    return await apiGet<DbLogRow>(`/api/logs/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

import { apiPost } from "@/lib/apiClient";

// 기존 CreateResult 타입은 유지합니다.

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
  // 1. 공통 입력 검증
  const v = validateCreate(input);

  validateContentBlocks({
    content: input.content,
    attachments: input.attachments ?? [],
    links: input.links ?? [],
  });

  // 2. API에 전달할 데이터 정규화
  const body = {
    title: v.title,
    content: v.content,
    tags: v.tags,
    table_data: input.table_data ?? null,
    attachments: input.attachments ?? [],
    links: input.links ?? [],
    source_filename: input.source_filename?.normalize("NFC").trim() || null,
    import_source: input.import_source ?? null,
  };

  // 3. 로컬 개발 환경에서는 Fastify API 사용
  const useLocalApi =
    import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_API === "true";

  if (useLocalApi) {
    return apiPost<CreateResult, typeof body>("/api/logs", body);
  }

  // 4. 기존 Supabase 직접 저장 로직
  // 이 위치에 이전 dbCreate()의 Supabase 저장 코드를 복원해야 합니다.
  throw new Error("Supabase 직접 저장 로직이 아직 복원되지 않았습니다.");
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
  // 기존 첨부파일·링크 참조 검증 유지
  validateContentBlocks({
    content: input.content,
    attachments: input.attachments ?? [],
    links: input.links ?? [],
  });

  // 기존 저장 규칙과 동일하게 데이터 정규화
  const updateData = {
    title: input.title.trim(),
    content: input.content,
    tags: input.tags,
    table_data: input.table_data ?? null,
    attachments: input.attachments ?? [],
    links: input.links ?? [],
    source_filename: input.source_filename?.normalize("NFC").trim() || null,
    import_source: input.import_source ?? null,
  };

  const useLocalApi =
    import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_API === "true";

  try {
    // 1. 로컬 개발 환경: Fastify PATCH API
    if (useLocalApi) {
      const row = await apiPatch<DbLogRow, typeof updateData>(
        `/api/logs/${encodeURIComponent(id)}`,
        updateData,
      );

      console.log("[dbUpdate] Fastify PATCH 성공:", row.id);

      return row;
    }

    // 2. 그 외 환경: 기존 Supabase 직접 수정
    const { error } = await supabase
      .from(TABLE_BASE)
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    const row = await dbGet(id);

    console.log("[dbUpdate] Supabase dbGet row:", row);
    console.log("[dbUpdate] row.attachments:", row?.attachments);

    if (!row) {
      throw new Error("Updated row not found in view");
    }

    return row;
  } catch (error) {
    await logError({
      category: "db",
      action: "update-log",
      page: window.location.pathname,
      error,
      meta: {
        id,
        titleLength: input.title.length,
      },
    });

    throw error;
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

export async function dbIsAttachmentReferenced(
  attachment: AttachmentItem,
): Promise<boolean> {
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  const user = auth.user;

  if (!user) {
    throw new Error("첨부파일 참조 여부를 확인하려면 로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from(TABLE_BASE)
    .select("id, attachments")
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  for (const row of data ?? []) {
    const attachments = Array.isArray(row.attachments)
      ? (row.attachments as AttachmentItem[])
      : [];

    const referenced = attachments.some(
      (item) =>
        item.id === attachment.id &&
        item.path === attachment.path &&
        (item.storageType ?? "supabase") === "local",
    );

    if (referenced) {
      return true;
    }
  }

  return false;
}
