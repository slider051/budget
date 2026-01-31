import type { Transaction } from "@/types/budget";
import { STORAGE_KEY } from "./constants";
import { notifyStorageChange } from "./storage/localStorageStore";

export interface StorageAdapter {
  save(transactions: readonly Transaction[]): void;
  load(): readonly Transaction[];
  clear(): void;
}

class LocalStorageAdapter implements StorageAdapter {
  save(transactions: readonly Transaction[]): void {
    if (typeof window === "undefined") return;

    try {
      const data = JSON.stringify(transactions);
      localStorage.setItem(STORAGE_KEY, data);
      notifyStorageChange(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  load(): readonly Transaction[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return [];
    }
  }

  clear(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      notifyStorageChange(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
