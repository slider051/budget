export type BudgetStatus = "ok" | "warning" | "over" | "unset" | "all";
export type BudgetSortBy = "usagePct" | "spent" | "remaining";
export type BudgetSortDir = "asc" | "desc";

export interface BudgetFilterState {
  readonly q: string;
  readonly status: BudgetStatus;
  readonly sort: BudgetSortBy;
  readonly dir: BudgetSortDir;
  readonly minUsage: string;
}

export const defaultBudgetFilterState: BudgetFilterState = {
  q: "",
  status: "all",
  sort: "usagePct",
  dir: "desc",
  minUsage: "",
};
