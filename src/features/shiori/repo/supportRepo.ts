import { supabase } from "@/lib/supabaseClient";
import type { SupportTicketDetailRow, SupportTicketListRow } from "../type";
import { assertValidSupportDraft } from "@/features/shiori/domain/validators/supportValidator";

const TABLE_BASE = "support_tickets";
const TABLE_VIEW = "support_tickets_v";

const SELECT_LIST =
  "id,user_id,nickname,title,body,status,created_at,updated_at";
const SELECT_DETAIL = SELECT_LIST;

export async function dbSupportCreate(input: { title: string; body: string }) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const cleaned = assertValidSupportDraft(input);

  const { data, error } = await supabase
    .from(TABLE_BASE)
    .insert({
      user_id: user.id,
      title: cleaned.title,
      body: cleaned.body,
      status: "open",
      is_deleted: false,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id as string };
}

export async function dbSupportUpdate(
  id: string,
  input: { title: string; body: string },
) {
  const cleaned = assertValidSupportDraft(input);

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  // 보안: 내 글만 수정
  const { error } = await supabase
    .from(TABLE_BASE)
    .update({ title: cleaned.title, body: cleaned.body })
    .eq("id", id)
    .eq("user_id", user.id);

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

export async function dbSupportListPage(args: {
  limit: number;
  offset: number;
}) {
  // TODO: view에 locale이 있으면 eq("locale", args.locale)
  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_LIST)
    .order("created_at", { ascending: false })
    .range(args.offset, args.offset + args.limit - 1);

  if (error) throw error;
  return (data ?? []) as SupportTicketListRow[];
}

export async function dbMyTicketsPage(args: { limit: number; offset: number }) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from(TABLE_VIEW)
    .select(SELECT_LIST)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(args.offset, args.offset + args.limit - 1);

  if (error) throw error;
  return (data ?? []) as SupportTicketListRow[];
}
