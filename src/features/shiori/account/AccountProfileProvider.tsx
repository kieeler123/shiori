import { createContext, useContext } from "react";
import { useAccountProfile } from "./hooks/useAccountProfile";
import type { AccountProfileCtxValue } from "@/features/shiori/type";

const AccountProfileCtx = createContext<AccountProfileCtxValue | null>(null);

export function AccountProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useAccountProfile()가 반환하는 shape을 그대로 Provider로 올림
  const value = useAccountProfile() as AccountProfileCtxValue;
  return (
    <AccountProfileCtx.Provider value={value}>
      {children}
    </AccountProfileCtx.Provider>
  );
}

export function useAccountProfileCtx() {
  const ctx = useContext(AccountProfileCtx);
  if (!ctx) {
    throw new Error(
      "useAccountProfileCtx must be used within <AccountProfileProvider />",
    );
  }
  return ctx;
}
