import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { buildNext, saveNext } from "@/lib/authRedirect";

export function RequireAuthOutlet() {
  const { session, ready } = useSession();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-6 text-sm t4">loading...</div>
    );
  }

  if (!session) {
    const from = buildNext(location.pathname, location.search);

    // 로그인 후 돌아올 위치 저장
    saveNext(from);

    return <Navigate to={`/auth?next=${encodeURIComponent(from)}`} replace />;
  }

  return <Outlet />;
}
