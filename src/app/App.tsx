import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/app/layout/Layout";

import LogsPage from "@/features/shiori/pages/logs/LogsPage";
import LogDetailPage from "@/features/shiori/pages/logs/LogDetailPage";
import NewLogPage from "@/features/shiori/pages/logs/NewLogPage";
import EditLogPage from "@/features/shiori/pages/logs/EditLogPage";
import TrashPage from "@/features/shiori/pages/logs/TrashPage";

import SupportLayout from "./layout/SupportLayout";
import SupportListPage from "@/features/shiori/pages/support/SupportListPage";
import SupportFaqPage from "@/features/shiori/pages/support/SupportFaqPage";
import SupportDetailPage from "@/features/shiori/pages/support/SupportDetailPage";
import SupportNewPage from "@/features/shiori/pages/support/SupportNewPage";
import MyTicketsPage from "@/features/shiori/pages/support/MyTicketPage";
import SupportTrashPage from "@/features/shiori/pages/support/SupportTrashPage";
import SupportEditPage from "@/features/shiori/pages/support/SupportEditPage";

import AuthPage from "@/features/shiori/pages/auths/AuthPage";
import AuthCallback from "@/features/auth/AuthCallback";

import AccountPage from "@/features/shiori/pages/account/AccountPage";
import AccountEditPage from "@/features/shiori/pages/account/AccountEditPage";
import AccountDeletePage from "@/features/shiori/pages/account/AccountDeletePage";

import { RequireAuthOutlet } from "@/app/layout/RequireAuthOutlet";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* ✅ 공개: 로그인 */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ✅ 공개: 읽기 */}
        <Route path="/" element={<LogsPage />} />
        <Route path="/logs/:id" element={<LogDetailPage />} />

        <Route path="/support" element={<SupportLayout />}>
          <Route index element={<SupportListPage />} />
          <Route path="/faq" element={<SupportFaqPage />} />
          <Route path=":id" element={<SupportDetailPage />} />

          {/* ✅ 보호: 쓰기/개인 */}
          <Route element={<RequireAuthOutlet />}>
            <Route path="new" element={<SupportNewPage />} />
            <Route path="mine" element={<MyTicketsPage />} />
            <Route path="trash" element={<SupportTrashPage />} />
            <Route path=":id/edit" element={<SupportEditPage />} />
          </Route>
        </Route>

        {/* ✅ 보호: 로그 쓰기/휴지통/계정 */}
        <Route element={<RequireAuthOutlet />}>
          <Route path="/logs/new" element={<NewLogPage />} />
          <Route path="/logs/:id/edit" element={<EditLogPage />} />
          <Route path="/trash" element={<TrashPage />} />

          <Route path="/settings/account" element={<AccountPage />} />
          <Route path="/settings/account/edit" element={<AccountEditPage />} />
          <Route
            path="/settings/account/delete"
            element={<AccountDeletePage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
