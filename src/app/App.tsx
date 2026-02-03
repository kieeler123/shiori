import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/app/layout/Layout";

import LogsPage from "@/pages/logs/LogsPage";
import LogDetailPage from "@/pages/logs/LogDetailPage";
import SupportListPage from "@/pages/feedbacks/SupportListPage";
import SupportNewPage from "@/pages/feedbacks/SupportNewPage";
import SupportDetailPage from "@/pages/feedbacks/SupportDetailPage";

import AuthCallback from "@/features/auth/AuthCallback";

import TrashPage from "@/pages/TrashPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LogsPage />} />
        <Route path="/logs/:id" element={<LogDetailPage />} />

        <Route path="/support" element={<SupportListPage />} />
        <Route path="/support/new" element={<SupportNewPage />} />
        <Route path="/support/:id" element={<SupportDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/trash" element={<TrashPage />} />
      </Route>
    </Routes>
  );
}
