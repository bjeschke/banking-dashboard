import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Transaction, TransactionFilter } from '../types';
import { saveToStorage, loadFromStorage } from '../utils';
import { mockTransactions, INITIAL_BALANCE } from '../data/mockData';
import {
  bankingReducer,
  BankingState,
  defaultFilter,
  LastAction,
} from '../reducers/bankingReducer';
import {
  validateAddTransaction,
  validateUpdateTransaction,
  calculateImportDelta,
} from '../services/transactionService';

interface BankingContextType {
  // State
  balance: number;
  transactions: Transaction[];
  filter: TransactionFilter;
  currentPage: number;
  lastAction: LastAction | null;
  editingTransaction: Transaction | null;
  reuseTransaction: Transaction | null;
  // Actions
  addTransaction: (t: Transaction) => string | null;
  deleteTransaction: (id: string) => void;
  updateTransaction: (t: Transaction) => string | null;
  setFilter: (f: Partial<TransactionFilter>) => void;
  resetFilter: () => void;
  setPage: (p: number) => void;
  undo: () => void;
  setEditingTransaction: (t: Transaction | null) => void;
  setReuseTransaction: (t: Transaction | null) => void;
  importTransactions: (txs: Transaction[]) => void;
}

const BankingContext = createContext<BankingContextType | null>(null);

const initialState: BankingState = {
  balance: INITIAL_BALANCE,
  transactions: mockTransactions,
  filter: defaultFilter,
  currentPage: 1,
  lastAction: null,
  editingTransaction: null,
  reuseTransaction: null,
};

export function BankingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bankingReducer, initialState);

  // Load saved data on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved?.transactions.length) {
      dispatch({
        type: 'LOAD_SAVED',
        payload: { balance: saved.balance, transactions: saved.transactions },
      });
    }
  }, []);

  // Persist changes
  useEffect(() => {
    saveToStorage(state.balance, state.transactions);
  }, [state.balance, state.transactions]);

  // Action handlers that use the service for validation
  function addTransaction(t: Transaction): string | null {
    const result = validateAddTransaction(t, state.balance);
    if (!result.success) {
      return result.error;
    }
    dispatch({ type: 'ADD_TRANSACTION', payload: { transaction: t, delta: result.delta } });
    return null;
  }

  function deleteTransaction(id: string): void {
    dispatch({ type: 'DELETE_TRANSACTION', payload: { id } });
  }

  function updateTransaction(t: Transaction): string | null {
    const oldTransaction = state.transactions.find(tx => tx.id === t.id);
    if (!oldTransaction) {
      return 'Transaction not found';
    }

    const result = validateUpdateTransaction(t, oldTransaction, state.balance);
    if (!result.success) {
      return result.error;
    }

    dispatch({
      type: 'UPDATE_TRANSACTION',
      payload: { transaction: t, newBalance: result.newBalance, oldTransaction },
    });
    return null;
  }

  function importTransactions(txs: Transaction[]): void {
    const delta = calculateImportDelta(txs);
    dispatch({ type: 'IMPORT_TRANSACTIONS', payload: { transactions: txs, delta } });
  }

  const ctx: BankingContextType = {
    // State
    balance: state.balance,
    transactions: state.transactions,
    filter: state.filter,
    currentPage: state.currentPage,
    lastAction: state.lastAction,
    editingTransaction: state.editingTransaction,
    reuseTransaction: state.reuseTransaction,
    // Actions
    addTransaction,
    deleteTransaction,
    updateTransaction,
    setFilter: (f) => dispatch({ type: 'SET_FILTER', payload: f }),
    resetFilter: () => dispatch({ type: 'RESET_FILTER' }),
    setPage: (p) => dispatch({ type: 'SET_PAGE', payload: p }),
    undo: () => dispatch({ type: 'UNDO' }),
    setEditingTransaction: (t) => dispatch({ type: 'SET_EDITING', payload: t }),
    setReuseTransaction: (t) => dispatch({ type: 'SET_REUSE', payload: t }),
    importTransactions,
  };

  return (
    <BankingContext.Provider value={ctx}>
      {children}
    </BankingContext.Provider>
  );
}

export function useBanking() {
  const ctx = useContext(BankingContext);
  if (!ctx) {
    throw new Error('useBanking must be used within BankingProvider');
  }
  return ctx;
}
