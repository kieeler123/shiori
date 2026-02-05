import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/app/layout/Layout";

import LogsPage from "@/features/shiori/pages/logs/LogsPage";
import LogDetailPage from "@/features/shiori/pages/logs/LogDetailPage";
import SupportListPage from "@/features/shiori/pages/support/SupportListPage";
import SupportNewPage from "@/features/shiori/pages/support/SupportNewPage";
import SupportDetailPage from "@/features/shiori/pages/support/SupportDetailPage";

import AuthCallback from "@/features/auth/AuthCallback";

import TrashPage from "@/features/shiori/pages/logs/TrashPage";
import NewLogPage from "@/features/shiori/pages/logs/NewLogPage";
import MyTicketsPage from "@/features/shiori/pages/support/MyTicketPage";
import SupportTrashPage from "@/features/shiori/pages/support/SupportTrashPage";
import SupportEditPage from "@/features/shiori/pages/support/SupportEditPage";
import SupportLayout from "./layout/SupportLayout";
import SupportFaqPage from "@/features/shiori/pages/support/SupportFaqPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LogsPage />} />

        <Route path="/logs/new" element={<NewLogPage />} />
        <Route path="/logs/:id" element={<LogDetailPage />} />

        <Route path="/support" element={<SupportLayout />}>
          <Route index element={<SupportListPage />} />
          <Route path="faq" element={<SupportFaqPage />} />
          <Route path="new" element={<SupportNewPage />} />
          <Route path="mine" element={<MyTicketsPage />} />
          <Route path="trash" element={<SupportTrashPage />} />
          <Route path=":id" element={<SupportDetailPage />} />
          <Route path=":id/edit" element={<SupportEditPage />} />
        </Route>
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
