"use client";

import { useTranslations } from "next-intl";
import TransactionForm from "@/components/transactions/TransactionForm";
import PageHeader from "@/components/ui/PageHeader";
import InfoBanner from "@/components/ui/InfoBanner";
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
        <InfoBanner
          title={t("quickTip")}
          description={t("quickTipDesc")}
          className="mb-6"
        />

        <TransactionForm />
      </div>
    </div>
  );
}
