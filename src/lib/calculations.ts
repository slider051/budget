import type { Transaction, BudgetSummary, CategorySummary, TransactionType } from '@/types/budget';

export function calculateSummary(transactions: readonly Transaction[]): BudgetSummary {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export function filterTransactions(
  transactions: readonly Transaction[],
  type: TransactionType | 'all',
  category: string | 'all'
): readonly Transaction[] {
  return transactions.filter(t => {
    const typeMatch = type === 'all' || t.type === type;
    const categoryMatch = category === 'all' || t.category === category;
    return typeMatch && categoryMatch;
  });
}

export function groupByCategory(
  transactions: readonly Transaction[],
  type?: TransactionType
): readonly CategorySummary[] {
  const filtered = type
    ? transactions.filter(t => t.type === type)
    : transactions;

  const grouped = filtered.reduce((acc, t) => {
    const existing = acc.get(t.category);
    if (existing) {
      return new Map(acc).set(t.category, {
        category: t.category,
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      });
    }
    return new Map(acc).set(t.category, {
      category: t.category,
      amount: t.amount,
      count: 1,
    });
  }, new Map<string, CategorySummary>());

  return Array.from(grouped.values()).sort((a, b) => b.amount - a.amount);
}

export function sortTransactionsByDate(
  transactions: readonly Transaction[],
  order: 'asc' | 'desc' = 'desc'
): readonly Transaction[] {
  const sorted = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
  return sorted;
}
