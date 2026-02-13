import { Outlet } from "react-router-dom";
import Header from "@/app/Header";
import ToastProvider from "@/app/layout/ToastProvider";
import { AccountProfileProvider } from "@/features/shiori/account/AccountProfileProvider";
import { PageContainer } from "./PageContainer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-app text-[var(--text-1)]">
      <PageContainer>
        <AccountProfileProvider>
          <Header />
          <main className="min-h-[calc(100vh-120px)]">
            <Outlet />
          </main>
        </AccountProfileProvider>
      </PageContainer>

      <footer className="border-t border-[var(--border-soft)] px-6 py-4 text-xs t5">
        <div className="mx-auto max-w-3xl flex justify-between">
          <span>Shiori v0</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>

      <ToastProvider />
    </div>
  );
}
