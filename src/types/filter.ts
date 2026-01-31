export interface TransactionFilterState {
  readonly q: string;
  readonly type: "all" | "income" | "expense";
  readonly categories: readonly string[];
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly minAmount: string;
  readonly maxAmount: string;
  readonly sort: "latest" | "oldest" | "amount-asc" | "amount-desc";
}

export const defaultFilterState: TransactionFilterState = {
  q: "",
  type: "all",
  categories: [],
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  sort: "latest",
};
