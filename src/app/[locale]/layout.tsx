import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BudgetProvider } from "@/context/BudgetContext";
import { UIProvider } from "@/context/UIContext";
import AppLayoutShell from "@/components/ui/AppLayoutShell";
import { ThemeClassApplier } from "@/components/ThemeClassApplier";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Qoint - Budget Tracker",
  description: "예산을 쉽고 스마트하게 관리하세요",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeClassApplier />
          <UIProvider>
            <BudgetProvider>
              <AppLayoutShell>{children}</AppLayoutShell>
            </BudgetProvider>
          </UIProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
