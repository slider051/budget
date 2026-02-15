"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { budgetReducer, initialState } from "./budgetReducer";
import type {
  BudgetState,
  Transaction,
  TransactionType,
  FixedExpenseInput,
} from "@/types/budget";
import {
  deleteTransactionById,
  deleteTransactionsByIds,
  insertTransaction,
  listTransactions,
  upsertTransactions,
} from "@/lib/transactions/transactionRepository";

interface BudgetContextValue {
  state: BudgetState;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt">,
  ) => Promise<void>;
  replaceTransactions: (transactions: readonly Transaction[]) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilter: (
    type?: TransactionType | "all",
    category?: string | "all",
  ) => void;
  addFixedExpenses: (input: FixedExpenseInput) => Promise<void>;
}

export const BudgetContext = createContext<BudgetContextValue | undefined>(
  undefined,
);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const pathname = usePathname();
  const shouldSkipSync =
    pathname.startsWith("/login") || pathname.startsWith("/auth");

  const refreshTransactions = useCallback(async () => {
    try {
      const loaded = await listTransactions();
      dispatch({ type: "LOAD_TRANSACTIONS", payload: loaded });
    } catch (error) {
      console.error("Failed to load transactions from Supabase:", error);
    }
  }, []);

  useEffect(() => {
    if (shouldSkipSync) return;
    void refreshTransactions();
  }, [refreshTransactions, shouldSkipSync]);

  const addTransaction = (
    transaction: Omit<Transaction, "id" | "createdAt">,
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    return insertTransaction(newTransaction)
      .then(() => refreshTransactions())
      .catch((error) => {
        console.error("Failed to add transaction:", error);
        throw error;
      });
  };

  const deleteTransaction = (id: string) => {
    return deleteTransactionById(id)
      .then(() => refreshTransactions())
      .catch((error) => {
        console.error("Failed to delete transaction:", error);
        throw error;
      });
  };

  const replaceTransactions = (transactions: readonly Transaction[]) => {
    const existingIds = state.transactions.map((item) => item.id);
    const nextIds = new Set(transactions.map((item) => item.id));
    const idsToDelete = existingIds.filter((id) => !nextIds.has(id));

    return Promise.all([
      deleteTransactionsByIds(idsToDelete),
      upsertTransactions(transactions),
    ])
      .then(() => refreshTransactions())
      .catch((error) => {
        console.error("Failed to replace transactions:", error);
        throw error;
      });
  };

  const setFilter = (
    type?: TransactionType | "all",
    category?: string | "all",
  ) => {
    dispatch({
      type: "SET_FILTER",
      payload: { type, category },
    });
  };

  const addFixedExpenses = (input: FixedExpenseInput) => {
    const transactions: Transaction[] = [];

    for (let month = input.startMonth; month <= input.endMonth; month++) {
      const date = new Date(input.year, month - 1, input.dayOfMonth);
      const formattedDate = date.toISOString().split("T")[0];

      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: "expense",
        amount: input.amount,
        category: input.category,
        description: input.description,
        date: formattedDate,
        createdAt: new Date().toISOString(),
      };

      transactions.push(newTransaction);
    }

    return upsertTransactions(transactions)
      .then(() => refreshTransactions())
      .catch((error) => {
        console.error("Failed to add fixed expenses:", error);
        throw error;
      });
  };

  const value: BudgetContextValue = {
    state,
    addTransaction,
    replaceTransactions,
    deleteTransaction,
    setFilter,
    addFixedExpenses,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}
