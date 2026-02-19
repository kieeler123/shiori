// src/features/shiori/account/repo/AccountTrashRepo.ts
import { supabase } from "@/lib/supabaseClient";

async function requireSession(): Promise<void> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Not signed in");
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("Not signed in");
  return uid;
}

/**
 * ✅ 계정 탈퇴 요청 (soft delete)
 * - profiles + shiori_items + shiori_comments + support_tickets 를 한 번에 soft delete
 * - 30일 purge_at 설정
 * - deleted_reason='account_delete'
 */
export async function dbRequestAccountDelete(): Promise<void> {
  await requireUserId(); // 로그인 체크만
  const { error } = await supabase.rpc("request_account_delete");
  if (error) throw error;
}

export type RestoreAccountResult = {
  restored: boolean;
  purge_at: string | null;
  deleted_at: string | null;
};

export async function dbRestoreAccountIfPossible(): Promise<RestoreAccountResult> {
  await requireSession();
  const { data, error } = await supabase.rpc("restore_account_if_possible");
  if (error) throw error;

  const row = (data ?? null) as RestoreAccountResult | null;
  return (
    row ?? {
      restored: false,
      purge_at: null,
      deleted_at: null,
    }
  );
}

export type DeleteStatus = {
  is_deleted: boolean;
  deleted_at: string | null;
  purge_at: string | null;
};

export async function dbGetMyDeleteStatus(): Promise<DeleteStatus> {
  const uid = await requireUserId();

  const { data, error } = await supabase
    .from("profiles")
    .select("is_deleted, deleted_at, purge_at")
    .eq("id", uid)
    .maybeSingle();

  if (error) throw error;

  return {
    is_deleted: Boolean(data?.is_deleted ?? false),
    deleted_at: (data?.deleted_at ?? null) as string | null,
    purge_at: (data?.purge_at ?? null) as string | null,
  };
}
