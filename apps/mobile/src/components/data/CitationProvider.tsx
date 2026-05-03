import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Citation } from "@wellcore/shared/citations";

type CitationContextValue = {
  open: (citation: Citation) => void;
  close: () => void;
  current: Citation | null;
};

const CitationContext = createContext<CitationContextValue | null>(null);

export function CitationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Citation | null>(null);

  const value = useMemo<CitationContextValue>(() => ({
    open: (c) => setCurrent(c),
    close: () => setCurrent(null),
    current,
  }), [current]);

  return <CitationContext.Provider value={value}>{children}</CitationContext.Provider>;
}

export function useCitation() {
  const ctx = useContext(CitationContext);
  if (!ctx) throw new Error("useCitation must be used inside <CitationProvider>");
  return ctx;
}
