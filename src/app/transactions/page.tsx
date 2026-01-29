import TransactionFilters from "@/components/budget/TransactionFilters";
import TransactionList from "@/components/budget/TransactionList";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function TransactionsPage() {
  return (
    <div>
      <PageHeader
        title="거래내역"
        description="전체 수입과 지출 내역을 확인하세요"
        action={
          <Link href="/transactions/new">
            <Button size="sm">+ 새 거래 추가</Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <TransactionFilters />
        <TransactionList />
      </div>
    </div>
  );
}
