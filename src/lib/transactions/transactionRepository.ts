import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types/budget";

interface TransactionRow {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

function mapRowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    description: row.description ?? "",
    date: row.date,
    createdAt: row.created_at,
  };
}

function mapTransactionToRow(transaction: Transaction): TransactionRow {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
    created_at: transaction.createdAt,
  };
}

export async function listTransactions(): Promise<readonly Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("id,type,amount,category,description,date,created_at")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as TransactionRow[]).map(mapRowToTransaction);
}

export async function insertTransaction(
  transaction: Transaction,
): Promise<Transaction> {
  const supabase = createClient();
  const row = mapTransactionToRow(transaction);
  const { data, error } = await supabase
    .from("transactions")
    .insert(row)
    .select("id,type,amount,category,description,date,created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToTransaction(data as TransactionRow);
}

export async function deleteTransactionById(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertTransactions(
  transactions: readonly Transaction[],
): Promise<void> {
  const supabase = createClient();
  if (transactions.length === 0) return;

  const payload = transactions.map(mapTransactionToRow);
  const { error } = await supabase.from("transactions").upsert(payload);
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteTransactionsByIds(
  ids: readonly string[],
): Promise<void> {
  const supabase = createClient();
  if (ids.length === 0) return;

  const { error } = await supabase.from("transactions").delete().in("id", ids);
  if (error) {
    throw new Error(error.message);
  }
}
