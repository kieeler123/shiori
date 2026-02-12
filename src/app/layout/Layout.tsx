import { Outlet } from "react-router-dom";
import Header from "@/app/Header";
import ToastProvider from "@/app/layout/ToastProvider";
import { AccountProfileProvider } from "@/features/shiori/account/AccountProfileProvider";
import { useEffect } from "react";
import { PageContainer } from "./PageContainer";
import { initThemeName } from "@/shared/theme/theme.storage";

export default function Layout() {
  useEffect(() => {
    initThemeName();
  }, []);
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#111827_0%,_#0b1120_40%,_#070b15_100%)] text-[var(--text-main)]">
      <PageContainer>
        <AccountProfileProvider>
          <Header />

          <main className="min-h-[calc(100vh-120px)]">
            <Outlet />
          </main>
        </AccountProfileProvider>
      </PageContainer>

      <footer className="border-t border-[var(--border-soft)] px-6 py-4 text-xs text-[var(--text-sub)]">
        <div className="mx-auto max-w-3xl flex justify-between">
          <span>Shiori v0</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>

      <ToastProvider />
    </div>
  );
}
