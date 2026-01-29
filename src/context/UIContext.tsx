"use client";

import { createContext, useState, type ReactNode } from "react";

interface UIContextValue {
  selectedMonth: string; // YYYY-MM format
  setSelectedMonth: (month: string) => void;
}

export const UIContext = createContext<UIContextValue | undefined>(undefined);

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function UIProvider({ children }: { children: ReactNode }) {
  // Always use getCurrentMonth() for initial value
  // SessionStorage persistence removed to avoid hydration issues
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  const value: UIContextValue = {
    selectedMonth,
    setSelectedMonth,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
