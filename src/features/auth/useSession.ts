import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

export function useSession() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log("🔵 getSession start");

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("getSession error:", error.message);
        }

        if (!mounted) return;

        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);

        console.log(
          "🟢 session loaded:",
          data.session?.user?.email ?? "no session",
        );
      } catch (err) {
        console.error("🔥 session crash:", err);
      } finally {
        if (mounted) {
          console.log("🟣 ready=true");
          setReady(true); // 🔥 무조건 실행됨
        }
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("🟡 auth change:", session?.user?.email ?? "logged out");
        setSession(session);
        setUser(session?.user ?? null);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    ready,
    session,
    user,
    isAuthed: !!user,
    userId: user?.id ?? null,
  };
}
