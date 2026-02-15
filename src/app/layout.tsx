import type { Metadata } from "next";
import "./globals.css";
import { BudgetProvider } from "@/context/BudgetContext";
import { UIProvider } from "@/context/UIContext";
import Sidebar from "@/components/ui/Sidebar";
import { ThemeClassApplier } from "@/components/ThemeClassApplier";
import { Analytics } from "@vercel/analytics/next";

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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('budget-app-theme') || 'system';
                  const resolved = theme === 'system'
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : theme;
                  if (resolved === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeClassApplier />
        <UIProvider>
          <BudgetProvider>
            <div className="flex min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
              <Sidebar />
              <main className="flex-1 px-6 py-6">
                <div className="mx-auto max-w-7xl">{children}</div>
              </main>
            </div>
          </BudgetProvider>
        </UIProvider>
        <Analytics />
      </body>
    </html>
  );
}
