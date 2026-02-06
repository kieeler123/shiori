import { Outlet } from "react-router-dom";
import Header from "@/app/Header";
import ToastProvider from "@/app/layout/ToastProvider";
import { AccountProfileProvider } from "@/features/shiori/account/AccountProfileProvider";

export default function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <AccountProfileProvider>
        <Header />
        <main className="min-h-screen">
          <Outlet />
        </main>
      </AccountProfileProvider>

      <footer className="border-t border-zinc-800/70 px-6 py-4 text-xs text-zinc-500">
        <div className="mx-auto max-w-3xl flex justify-between">
          <span>Shiori v0</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>

      {/* 🔥 전역 메시지 레이어 */}
      <ToastProvider />
    </div>
  );
}
