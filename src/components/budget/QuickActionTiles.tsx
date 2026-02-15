"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface QuickAction {
  titleKey: string;
  descKey: string;
  icon: string;
  href: string;
  color: string;
}

const actions: readonly QuickAction[] = [
  {
    titleKey: "budgetStatus",
    descKey: "budgetStatusDesc",
    icon: "💰",
    href: "/budget",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    titleKey: "addTransaction",
    descKey: "addTransactionDesc",
    icon: "➕",
    href: "/transactions/new",
    color: "bg-green-50 text-green-600",
  },
  {
    titleKey: "fixedExpenseSetup",
    descKey: "fixedExpenseSetupDesc",
    icon: "🔁",
    href: "/fixed-expenses/new",
    color: "bg-purple-50 text-purple-600",
  },
  {
    titleKey: "transactionHistory",
    descKey: "transactionHistoryDesc",
    icon: "📝",
    href: "/transactions",
    color: "bg-blue-50 text-blue-600",
  },
];

export default function QuickActionTiles() {
  const t = useTranslations("quickActions");

  return (
    <div className="flex flex-wrap gap-6">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="w-[240px] bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div
            className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
          >
            {action.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t(action.titleKey)}
          </h3>
          <p className="text-sm text-gray-500">{t(action.descKey)}</p>
        </Link>
      ))}
    </div>
  );
}
