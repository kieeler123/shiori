// src/features/account/hooks/useAccountActions.ts
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAccountActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateNickname(nickname: string) {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
        error: uErr,
      } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase
        .from("profiles")
        .update({ nickname })
        .eq("id", user.id);

      if (error) throw error;
      return true;
    } catch (e: any) {
      setError(e?.message ?? "닉네임 수정 실패");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(newPassword: string) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return true;
    } catch (e: any) {
      setError(e?.message ?? "비밀번호 변경 실패");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function softDeleteAccount() {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
        error: uErr,
      } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      if (!user) throw new Error("로그인이 필요합니다.");

      const now = new Date();
      const purgeAt = new Date(now);
      purgeAt.setFullYear(purgeAt.getFullYear() + 1);

      const { error } = await supabase
        .from("profiles")
        .update({
          is_deleted: true,
          deleted_at: now.toISOString(),
          purge_at: purgeAt.toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await supabase.auth.signOut();
      return true;
    } catch (e: any) {
      setError(e?.message ?? "회원탈퇴 처리 실패");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, updateNickname, updatePassword, softDeleteAccount };
}
