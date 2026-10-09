import { createClient } from "@supabase/supabase-js";
import { env } from "../../config/env.js";

export type LogOrderBy =
  | "display_date"
  | "view_count"
  | "comment_count"
  | "created_at";

export type ListLogsQuery = {
  limit: number;
  offset: number;
  orderBy: LogOrderBy;
  ascending: boolean;
  userId?: string;
};

const TABLE_VIEW = "shiori_items_v";

const SELECT_LIST = `
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
  display_date,
  source_filename,
  import_source,
  profile:profiles!shiori_items_user_id_fkey (
    nickname,
    is_deleted
  ),
  attachments,
  links
`;

export async function findLogsPage(accessToken: string, query: ListLogsQuery) {
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { limit, offset, orderBy, ascending, userId } = query;

  let request = supabase
    .from(TABLE_VIEW)
    .select(SELECT_LIST)
    .range(offset, offset + limit - 1);

  if (userId) {
    request = request.eq("user_id", userId);
  }

  if (orderBy === "display_date") {
    request = request
      .order("display_date", {
        ascending,
        nullsFirst: false,
      })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  } else if (orderBy === "view_count") {
    request = request
      .order("view_count", { ascending })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  } else if (orderBy === "comment_count") {
    request = request
      .order("comment_count", { ascending })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  } else {
    request = request
      .order("created_at", { ascending })
      .order("id", { ascending: false });
  }

  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return data ?? [];
}

const SELECT_DETAIL = `
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

export async function findLogById(accessToken: string, id: string) {
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase
    .from("shiori_items_v")
    .select(SELECT_DETAIL)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

import type { CreateLogInput } from "./createSchema.js";

export async function insertLog(
  accessToken: string,
  userId: string,
  input: CreateLogInput,
) {
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const normalizedFilename =
    input.source_filename?.normalize("NFC").trim() || null;

  const { data: duplicates, error: dupError } = await supabase
    .from("shiori_items")
    .select("id")
    .eq("user_id", userId)
    .eq("title", input.title)
    .eq("content", input.content)
    .eq("is_deleted", false)
    .limit(1);

  if (dupError) {
    throw dupError;
  }

  if ((duplicates?.length ?? 0) > 0) {
    return {
      kind: "duplicate" as const,
    };
  }

  const { data, error } = await supabase
    .from("shiori_items")
    .insert({
      user_id: userId,
      title: input.title,
      content: input.content,
      tags: input.tags,

      is_deleted: false,
      is_hidden: false,

      table_data: input.table_data ?? null,
      attachments: input.attachments,
      links: input.links ?? [],
      source_filename: normalizedFilename,
      import_source: input.import_source ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    kind: "created" as const,
    id: data.id as string,
  };
}

export async function updateLogRepository(args: {
  id: string;
  userId: string;
  accessToken: string;
  input: {
    title: string;
    content: string;
    tags: string[];
    table_data?: unknown | null;
    attachments?: unknown[];
    links?: unknown[] | null;

    source_filename?: string | null;
    import_source?: "markdown" | null;
  };
}) {
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const updateData = {
    title: args.input.title,
    content: args.input.content,
    tags: args.input.tags,
    table_data: args.input.table_data ?? null,
    attachments: args.input.attachments ?? [],
    links: args.input.links ?? [],
    source_filename: args.input.source_filename ?? null,
    import_source: args.input.import_source ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("shiori_items")
    .update(updateData)
    .eq("id", args.id)
    .eq("user_id", args.userId)
    .eq("is_deleted", false)
    .select(
      "id,user_id,title,content,tags,table_data,attachments,links,source_filename,import_source,created_at,updated_at",
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteLogRepository(args: {
  id: string;
  userId: string;
  accessToken: string;
}) {
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase
    .from("shiori_items")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: args.userId,
    })
    .eq("id", args.id)
    .eq("user_id", args.userId)
    .eq("is_deleted", false)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/** 내 휴지통 목록 조회 */
export async function findTrashLogsMine(accessToken: string, userId: string) {
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase
    .from("shiori_trash_v")
    .select("id,title,content,deleted_at,deleted_by")
    .eq("user_id", userId)
    .order("deleted_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

/** 휴지통 글 복구 */
export async function restoreTrashLog(args: {
  id: string;
  userId: string;
  accessToken: string;
}) {
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase
    .from("shiori_items")
    .update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", args.id)
    .eq("user_id", args.userId)
    .eq("is_deleted", true)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function findLogForPermanentDelete(args: {
  id: string;
  userId: string;
  accessToken: string;
}) {
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase
    .from("shiori_items")
    .select("id,user_id,is_deleted,attachments")
    .eq("id", args.id)
    .eq("user_id", args.userId)
    .eq("is_deleted", true)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function permanentlyDeleteLogRow(args: {
  id: string;
  userId: string;
  accessToken: string;
}) {
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase
    .from("shiori_items")
    .delete()
    .eq("id", args.id)
    .eq("user_id", args.userId)
    .eq("is_deleted", true)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  return data;
}
