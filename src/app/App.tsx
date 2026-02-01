import { Routes, Route, Navigate } from "react-router-dom";
import LogsPage from "@/pages/LogsPage";
import LogDetailPage from "@/pages/LogDetailPage";
import AuthPage from "@/pages/AuthPage";
import AuthCallback from "@/features/auth/AuthCallback";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/logs" replace />} />
      <Route path="/logs" element={<LogsPage />} />
      <Route path="/logs/:id" element={<LogDetailPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/logs" replace />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}
