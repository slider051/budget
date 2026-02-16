"use client";

import { useTranslations } from "next-intl";
import TransactionForm from "@/components/budget/TransactionForm";
import PageHeader from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";

export default function NewTransactionPage() {
  const t = useTranslations("transactionForm");
  const tt = useTranslations("transactions");

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={tt("description")}
        action={
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              {tt("viewHistory")}
            </Button>
          </Link>
        }
      />

      <div className="section-stack-fixed">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                {t("quickTip")}
              </h4>
              <p className="text-sm text-blue-700">{t("quickTipDesc")}</p>
            </div>
          </div>
        </div>

        <TransactionForm />
      </div>
    </div>
  );
}
