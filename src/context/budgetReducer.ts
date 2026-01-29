import type { BudgetState, Transaction, TransactionType } from '@/types/budget';

export type BudgetAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_FILTER'; payload: { type?: TransactionType | 'all'; category?: string | 'all' } }
  | { type: 'LOAD_TRANSACTIONS'; payload: readonly Transaction[] };

export const initialState: BudgetState = {
  transactions: [],
  filter: {
    type: 'all',
    category: 'all',
  },
};

export function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: {
          type: action.payload.type ?? state.filter.type,
          category: action.payload.category ?? state.filter.category,
        },
      };

    case 'LOAD_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      };

    default:
      return state;
  }
}
