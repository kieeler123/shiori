import { supabase } from "@/lib/supabaseClient";

const TABLE_BASE = "support_tickets";
const TABLE_VIEW = "support_tickets_v";
const TABLE_TRASH_VIEW = "support_trash_v";

const SELECT_LIST = "id,user_id,nickname,title,status,created_at,updated_at";
const SELECT_DETAIL =
  "id,user_id,nickname,title,body,status,created_at,updated_at";

export type SupportTicketListRow = {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SupportTicketDetailRow = {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function dbSupportCreate(input: {
  title: string;
  body: string;
}): Promise<{ id: string }> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from(TABLE_BASE)
    .insert({
      user_id: user.id,
      title: input.title ?? "",
      body: input.body ?? "",
      status: "open",
      is_deleted: false,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

export async function dbSupportUpdate(
  id: string,
  input: { title: string; body: string },
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_BASE)
    .update({
      title: input.title ?? "",
      body: input.body ?? "",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function dbSupportRestore(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_BASE)
    .update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function dbSupportHardDelete(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_BASE).delete().eq("id", id);
  if (error) throw error;
}

export async function dbSupportList(): Promise<SupportTicketListRow[]> {
  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_LIST)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any;
}

export async function dbSupportGet(
  id: string,
): Promise<SupportTicketDetailRow | null> {
  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_DETAIL)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as any;
}

export async function dbMyTickets(): Promise<SupportTicketListRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_LIST)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any;
}

export async function dbMySupportTrash(): Promise<
  (SupportTicketListRow & {
    deleted_at: string | null;
    deleted_by: string | null;
  })[]
> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from(TABLE_TRASH_VIEW)
    .select(
      "id,user_id,nickname,title,status,created_at,updated_at,deleted_at,deleted_by",
    )
    .eq("deleted_by", user.id)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any;
}
