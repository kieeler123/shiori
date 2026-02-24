import { createContext, useContext, useMemo, useState } from "react";

type ShioriSearchCtx = {
  query: string;
  setQuery: (v: string) => void;
  clearQuery: () => void;

  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const Ctx = createContext<ShioriSearchCtx | null>(null);

export function ShioriSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<ShioriSearchCtx>(() => {
    return {
      query,
      setQuery,
      clearQuery: () => setQuery(""),

      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [query, isOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShioriSearch() {
  const v = useContext(Ctx);
  if (!v)
    throw new Error("useShioriSearch must be used within ShioriSearchProvider");
  return v;
}
