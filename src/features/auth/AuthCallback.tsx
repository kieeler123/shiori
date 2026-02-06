import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { loadNext, clearNext } from "@/lib/authRedirect";

export default function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    let done = false;

    const next = loadNext("/");

    // ✅ 1) 먼저 현재 세션 한번 확인
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (done) return;

      if (data.session) {
        clearNext();
        done = true;
        nav(next, { replace: true });
      }
    })();

    // ✅ 2) 레이스 대비: SIGNED_IN 이벤트를 기다림 (이게 핵심)
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (done) return;

      if (event === "SIGNED_IN" && session) {
        clearNext();
        done = true;
        nav(next, { replace: true });
      }
    });

    return () => {
      done = true;
      sub.subscription.unsubscribe();
    };
  }, [nav]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-zinc-400">
      로그인 처리 중...
    </div>
  );
}
