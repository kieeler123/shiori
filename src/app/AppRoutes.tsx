// src/app/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/app/layout/Layout";

import LogsPage from "@/features/shiori/pages/logs/LogsPage";
import LogDetailPage from "@/features/shiori/pages/logs/LogDetailPage";
import NewLogPage from "@/features/shiori/pages/logs/NewLogPage";
import EditLogPage from "@/features/shiori/pages/logs/EditLogPage";

import ProtectedRoute from "@/app/routes/ProtectedRoute";
import PublicOnlyRoute from "@/app/routes/PublicOnlyRoute";

// ✅ 여기 isAuthed는 네 실제 인증 상태로 연결
// 예: const isAuthed = !!user; 또는 useAuthStore().user 등
const isAuthed = false;

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* 홈은 일단 공개로 두되, 지금은 /logs로 보내도 됨 */}
        <Route path="/" element={<Navigate to="/logs" replace />} />

        {/* ✅ PUBLIC: 읽기는 누구나 */}
        <Route path="/logs/:id" element={<LogDetailPage />} />

        {/* ✅ PRIVATE: 관리(목록/작성/수정)는 로그인 필요 */}
        <Route element={<ProtectedRoute isAuthed={isAuthed} />}>
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/logs/new" element={<NewLogPage />} />
          <Route path="/logs/:id/edit" element={<EditLogPage />} />
        </Route>

        {/* not found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
