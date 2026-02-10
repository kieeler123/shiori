// src/app/routes/PublicOnlyRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

type Props = { isAuthed: boolean; redirectTo?: string };

export default function PublicOnlyRoute({
  isAuthed,
  redirectTo = "/logs",
}: Props) {
  if (isAuthed) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}
