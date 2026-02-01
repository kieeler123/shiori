import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../features/auth/hooks/useAuth";

function displayName(user: any) {
  return (
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "user"
  );
}

function avatarUrl(user: any) {
  return user?.user_metadata?.avatar_url || "";
}

export default function AppHeader() {
  const { user, loading } = useAuth();

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // 로컬이면 기본적으로 현재 origin 사용해도 됨.
        // redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        {/* Left */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-100">
              Shiori
            </h1>
            <span className="text-xs text-zinc-500">v0</span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            quick capture · tags · search
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-900/60" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 px-3 py-2">
                {avatarUrl(user) ? (
                  <img
                    src={avatarUrl(user)}
                    alt="avatar"
                    className="h-7 w-7 rounded-full border border-zinc-800/60"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="grid h-7 w-7 place-items-center rounded-full border border-zinc-800/60 bg-zinc-950/40 text-xs text-zinc-400">
                    {displayName(user).slice(0, 1).toUpperCase()}
                  </div>
                )}

                <span className="max-w-[140px] truncate text-sm text-zinc-200">
                  {displayName(user)}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="
                  rounded-xl border border-zinc-800/70 bg-transparent px-3 py-2 text-sm
                  text-zinc-400 transition
                  hover:bg-zinc-900/60 hover:text-zinc-100
                  active:scale-[0.98]
                  focus:outline-none focus:ring-2 focus:ring-zinc-700/60
                "
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={login}
              className="
                rounded-xl border border-zinc-700/70 bg-zinc-900/60 px-4 py-2 text-sm
                text-zinc-200 transition
                hover:bg-zinc-800 hover:text-white
                active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-zinc-700/60
              "
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
