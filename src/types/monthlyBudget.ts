export interface MonthlyBudget {
  readonly month: string; // YYYY-MM format
  readonly categories: Readonly<Record<string, number>>; // { "식비": 500000, ... }
  readonly updatedAt: string; // ISO timestamp
}

export interface YearBudgetTemplate {
  readonly year: number;
  readonly categories: Readonly<Record<string, number>>; // Monthly amounts per category
}
