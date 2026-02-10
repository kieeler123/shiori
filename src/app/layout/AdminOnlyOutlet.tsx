// src/app/layout/AdminOnlyOutlet.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth"; // 네 방식으로 변경

export function AdminOnlyOutlet() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // 1) 로그인 체크
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  // 2) 관리자 체크 (예: user.role === "admin")
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}
