// src/app/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

type Props = {
  isAuthed: boolean;
  redirectTo?: string;
};

export default function ProtectedRoute({
  isAuthed,
  redirectTo = "/login",
}: Props) {
  const location = useLocation();

  if (!isAuthed) {
    // 로그인 후 원래 가려던 곳으로 보내기 위해 state 저장
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
    );
  }
  return <Outlet />;
}
