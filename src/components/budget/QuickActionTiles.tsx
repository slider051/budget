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
    <div className="card-grid-glance-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="card-glance-item rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md group"
        >
          <div
            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl ${action.color} transition-transform group-hover:scale-110`}
          >
            {action.icon}
          </div>
          <h3 className="mb-1.5 text-base font-semibold text-gray-900">
            {t(action.titleKey)}
          </h3>
          <p className="text-sm leading-5 text-gray-500">{t(action.descKey)}</p>
        </Link>
      ))}
    </div>
  );
}
