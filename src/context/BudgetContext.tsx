"use client";

import { createContext, useReducer, useEffect, type ReactNode } from "react";
import { budgetReducer, initialState } from "./budgetReducer";
import type {
  BudgetState,
  Transaction,
  TransactionType,
  FixedExpenseInput,
} from "@/types/budget";
import { storage } from "@/lib/storage";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface BudgetContextValue {
  state: BudgetState;
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  replaceTransactions: (transactions: readonly Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  setFilter: (
    type?: TransactionType | "all",
    category?: string | "all",
  ) => void;
  addFixedExpenses: (input: FixedExpenseInput) => void;
}

export const BudgetContext = createContext<BudgetContextValue | undefined>(
  undefined,
);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const isClient = useLocalStorage();

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (isClient) {
      const loaded = storage.load();
      if (loaded.length > 0) {
        dispatch({ type: "LOAD_TRANSACTIONS", payload: loaded });
      }
    }
  }, [isClient]);

  // Save to localStorage when transactions change
  useEffect(() => {
    if (isClient && state.transactions.length >= 0) {
      storage.save(state.transactions);
    }
  }, [state.transactions, isClient]);

  const addTransaction = (
    transaction: Omit<Transaction, "id" | "createdAt">,
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_TRANSACTION", payload: newTransaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  };

  const replaceTransactions = (transactions: readonly Transaction[]) => {
    dispatch({ type: "LOAD_TRANSACTIONS", payload: transactions });
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

    transactions.forEach((transaction) => {
      dispatch({ type: "ADD_TRANSACTION", payload: transaction });
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
