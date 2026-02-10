import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth"; // 네 실제 훅/스토어로 변경

export function GuestOnlyOutlet() {
  const { user, loading } = useAuth(); // 예시

  if (loading) return null; // 또는 스피너
  if (user) return <Navigate to="/logs" replace />;

  return <Outlet />;
}
