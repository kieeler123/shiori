import { supabase } from "@/lib/supabaseClient";

import type {
  AttachmentItem,
  DbLogRow,
  LinkPreviewItem,
  TableData,
} from "@/features/shiori/type";

export const ADMIN_TABLE_BASE = "shiori_items";

export type AdminLogRow = DbLogRow & {
  source_filename?: string | null;
  import_source?: string | null;

  is_hidden: boolean;
  is_deleted: boolean;
  deleted_scope?: string | null;

  deleted_at?: string | null;
};

type AdminUpdateInput = {
  title: string;
  content: string;
  tags: string[];

  table_data?: TableData | null;

  attachments?: AttachmentItem[];
  links?: LinkPreviewItem[] | null;

  source_filename?: string | null;
  import_source?: string | null;
};

const ADMIN_SELECT_LIST = `
  id,
  user_id,
  title,
  content,
  tags,
  created_at,
  updated_at,
  view_count,
  comment_count,
  source_date,
  table_data,
  attachments,
  links,
  source_filename,
  import_source,
  is_hidden,
  is_deleted,
  deleted_scope,
  deleted_at
`;

const ADMIN_SELECT_DETAIL = ADMIN_SELECT_LIST;

/**
 * 관리자용 전체 로그 목록
 *
 * shiori_items_v가 아닌 base table을 직접 조회하므로
 * 숨김 글도 조회할 수 있다.
 */
export async function adminDbListLogs(): Promise<AdminLogRow[]> {
  const { data, error } = await supabase
    .from(ADMIN_TABLE_BASE)
    .select(ADMIN_SELECT_LIST)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("[adminDbListLogs] failed:", error);
    throw error;
  }

  return (data ?? []) as unknown as AdminLogRow[];
}

/**
 * 관리자용 상세 조회
 *
 * is_hidden = true 상태여도 조회 가능.
 */
export async function adminDbGet(id: string): Promise<AdminLogRow | null> {
  const { data, error } = await supabase
    .from(ADMIN_TABLE_BASE)
    .select(ADMIN_SELECT_DETAIL)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[adminDbGet] failed:", {
      id,
      error,
    });

    throw error;
  }

  return (data ?? null) as unknown as AdminLogRow | null;
}

/**
 * 관리자용 로그 수정
 *
 * 일반 dbUpdate()를 사용하지 않는 이유:
 *
 * 일반 dbUpdate()
 * → update
 * → dbGet()
 * → shiori_items_v 조회
 *
 * 구조이므로 숨김 글은 update 후 다시 찾지 못할 수 있다.
 *
 * 관리자용은 base table에서 update + select를 한 번에 처리한다.
 */
export async function adminDbUpdate(
  id: string,
  input: AdminUpdateInput,
): Promise<AdminLogRow> {
  const sourceFilename = input.source_filename?.normalize("NFC").trim() || null;

  const importSource = input.import_source?.trim() || null;

  const { data, error } = await supabase
    .from(ADMIN_TABLE_BASE)
    .update({
      title: input.title.trim(),
      content: input.content,
      tags: input.tags,

      table_data: input.table_data ?? null,

      attachments: input.attachments ?? [],
      links: input.links ?? [],

      source_filename: sourceFilename,
      import_source: importSource,

      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(ADMIN_SELECT_DETAIL)
    .single();

  if (error) {
    console.error("[adminDbUpdate] failed:", {
      id,
      error,
    });

    throw error;
  }

  return data as unknown as AdminLogRow;
}

/**
 * 숨김 / 숨김 해제
 *
 * hidden = true  → 숨김
 * hidden = false → 숨김 해제
 */
export async function adminSetLogHidden(
  id: string,
  hidden: boolean,
): Promise<AdminLogRow> {
  const { data, error } = await supabase
    .from(ADMIN_TABLE_BASE)
    .update({
      is_hidden: hidden,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(ADMIN_SELECT_DETAIL)
    .single();

  if (error) {
    console.error("[adminSetLogHidden] failed:", {
      id,
      hidden,
      error,
    });

    throw error;
  }

  return data as unknown as AdminLogRow;
}

/**
 * 숨김 해제 전용 shortcut
 */
export async function adminUnhideLog(id: string): Promise<AdminLogRow> {
  return adminSetLogHidden(id, false);
}

/**
 * 숨김 전용 shortcut
 */
export async function adminHideLog(id: string): Promise<AdminLogRow> {
  return adminSetLogHidden(id, true);
}

/**
 * 관리자용 Markdown 숨김 목록
 *
 * 자동 필터 오탐으로 숨겨진 Markdown을 점검할 때 사용.
 */
export async function adminListHiddenMarkdownLogs(): Promise<AdminLogRow[]> {
  const { data, error } = await supabase
    .from(ADMIN_TABLE_BASE)
    .select(ADMIN_SELECT_LIST)
    .eq("is_hidden", true)
    .eq("is_deleted", false)
    .is("deleted_scope", null)
    .eq("import_source", "markdown")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("[adminListHiddenMarkdownLogs] failed:", error);

    throw error;
  }

  return (data ?? []) as unknown as AdminLogRow[];
}

/**
 * 관리자용 숨김 글 전체 조회
 *
 * Markdown뿐 아니라 일반 숨김 글도 포함.
 */
export async function adminListHiddenLogs(): Promise<AdminLogRow[]> {
  const { data, error } = await supabase
    .from(ADMIN_TABLE_BASE)
    .select(ADMIN_SELECT_LIST)
    .eq("is_hidden", true)
    .eq("is_deleted", false)
    .is("deleted_scope", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("[adminListHiddenLogs] failed:", error);
    throw error;
  }

  return (data ?? []) as unknown as AdminLogRow[];
}
