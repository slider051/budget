export type TransactionType = "income" | "expense";

export interface Transaction {
  readonly id: string;
  readonly type: TransactionType;
  readonly amount: number;
  readonly category: string;
  readonly description: string;
  readonly date: string; // YYYY-MM-DD
  readonly createdAt: string; // ISO timestamp
}

export interface BudgetState {
  readonly transactions: readonly Transaction[];
  readonly filter: {
    readonly type: TransactionType | "all";
    readonly category: string | "all";
  };
}

export interface BudgetSummary {
  readonly totalIncome: number;
  readonly totalExpense: number;
  readonly balance: number;
}

export interface CategorySummary {
  readonly category: string;
  readonly amount: number;
  readonly count: number;
}

export interface CategoryBudget {
  readonly category: string;
  readonly budget: number;
  readonly spent: number;
}

export interface FixedExpenseInput {
  readonly amount: number;
  readonly category: string;
  readonly description: string;
  readonly dayOfMonth: number;
  readonly startMonth: number;
  readonly endMonth: number;
  readonly year: number;
}
