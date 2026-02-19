import { createContext, useContext, useMemo, useState } from "react";

type ShioriSearchCtx = {
  query: string;
  setQuery: (v: string) => void;
  clearQuery: () => void;
};

const Ctx = createContext<ShioriSearchCtx | null>(null);

export function ShioriSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  const value = useMemo(
    () => ({
      query,
      setQuery,
      clearQuery: () => setQuery(""),
    }),
    [query],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShioriSearch() {
  const v = useContext(Ctx);
  if (!v)
    throw new Error("useShioriSearch must be used within ShioriSearchProvider");
  return v;
}
