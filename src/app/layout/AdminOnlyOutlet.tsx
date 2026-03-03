// src/app/layout/AdminOnlyOutlet.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { isAdmin } from "@/shared/auth/admin";

export function AdminOnlyOutlet() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
