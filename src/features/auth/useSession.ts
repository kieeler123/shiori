import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1️⃣ 최초 세션 로드
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setReady(true);
    });

    // 2️⃣ 🔥 세션 변경 구독 (이게 핵심)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setReady(true);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    ready,
    session,
    user,
    isAuthed: !!session, // ✅ 여기
    userId: session?.user?.id ?? null,
  };
}
