import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    const handle = async () => {
      // 🔥 이 한 줄이 세션을 확정하는 핵심
      await supabase.auth.getSession();

      nav("/", { replace: true });
    };
    handle();
  }, [nav]);

  return (
    <div className="min-h-screen grid place-items-center text-zinc-400">
      로그인 처리 중...
    </div>
  );
}
