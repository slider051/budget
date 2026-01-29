import type { Metadata } from "next";
import "./globals.css";
import { BudgetProvider } from "@/context/BudgetContext";
import { UIProvider } from "@/context/UIContext";
import Sidebar from "@/components/ui/Sidebar";

export const metadata: Metadata = {
  title: "Qoint - Budget Tracker",
  description: "예산을 쉽고 스마트하게 관리하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">
        <UIProvider>
          <BudgetProvider>
            <div className="flex">
              <Sidebar />
              <main className="flex-1 px-6 py-6 max-w-7xl">{children}</main>
            </div>
          </BudgetProvider>
        </UIProvider>
      </body>
    </html>
  );
}
