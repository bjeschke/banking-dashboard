import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, TransactionFilter } from '../types';
import { saveToStorage, loadFromStorage } from '../utils';
import { mockTransactions, INITIAL_BALANCE } from '../data/mockData';

interface BankingContextType {
  balance: number;
  transactions: Transaction[];
  filter: TransactionFilter;
  currentPage: number;
  lastAction: { type: string; data: any } | null;
  editingTransaction: Transaction | null;
  reuseTransaction: Transaction | null;
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

const defaultFilter: TransactionFilter = {
  type: 'all',
  dateFrom: '',
  dateTo: '',
  searchTerm: '',
};

const BankingContext = createContext<BankingContextType | null>(null);

export function BankingProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filter, setFilterState] = useState<TransactionFilter>(defaultFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastAction, setLastAction] = useState<{ type: string; data: any } | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [reuseTransaction, setReuseTransaction] = useState<Transaction | null>(null);

  // load saved data on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved?.transactions.length) {
      setBalance(saved.balance);
      setTransactions(saved.transactions);
    }
  }, []);

  // persist changes
  useEffect(() => {
    saveToStorage(balance, transactions);
  }, [balance, transactions]);

  function addTransaction(t: Transaction): string | null {
    // check if user has enough money for withdrawal
    if (t.type === 'withdrawal' && t.amount > balance) {
      return `Insufficient balance. Available: ${balance.toFixed(2)} EUR`;
    }

    const delta = t.type === 'deposit' ? t.amount : -t.amount;
    setBalance(prev => prev + delta);
    setTransactions(prev => [t, ...prev]);
    setLastAction({ type: 'add', data: { transaction: t, prevBalance: balance } });
    setCurrentPage(1);
    return null;
  }

  function deleteTransaction(id: string) {
    const t = transactions.find(tx => tx.id === id);
    if (!t) return;

    // reverse the transaction effect on balance
    const delta = t.type === 'deposit' ? -t.amount : t.amount;
    setBalance(prev => prev + delta);
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    setLastAction({ type: 'delete', data: { transaction: t, prevBalance: balance } });
  }

  function updateTransaction(t: Transaction): string | null {
    const old = transactions.find(tx => tx.id === t.id);
    if (!old) return 'Transaction not found';

    // calc new balance: remove old effect, add new effect
    let newBal = balance;
    newBal += old.type === 'deposit' ? -old.amount : old.amount;
    newBal += t.type === 'deposit' ? t.amount : -t.amount;

    if (newBal < 0) {
      return `This would result in negative balance: ${newBal.toFixed(2)} EUR`;
    }

    setBalance(newBal);
    setTransactions(prev => prev.map(tx => tx.id === t.id ? t : tx));
    setLastAction({ type: 'edit', data: { oldTransaction: old, prevBalance: balance } });
    setEditingTransaction(null);
    return null;
  }

  function undo() {
    if (!lastAction) return;

    const { type, data } = lastAction;

    if (type === 'add') {
      setTransactions(prev => prev.filter(t => t.id !== data.transaction.id));
    } else if (type === 'delete') {
      setTransactions(prev => [data.transaction, ...prev]);
    } else if (type === 'edit') {
      setTransactions(prev => prev.map(t =>
        t.id === data.oldTransaction.id ? data.oldTransaction : t
      ));
    }

    setBalance(data.prevBalance);
    setLastAction(null);
  }

  function setFilter(f: Partial<TransactionFilter>) {
    setFilterState(prev => ({ ...prev, ...f }));
    setCurrentPage(1); // reset to first page on filter change
  }

  function resetFilter() {
    setFilterState(defaultFilter);
    setCurrentPage(1);
  }

  function importTransactions(txs: Transaction[]) {
    // calc total balance change from imports
    const delta = txs.reduce((sum, t) =>
      sum + (t.type === 'deposit' ? t.amount : -t.amount), 0);

    setBalance(prev => prev + delta);
    setTransactions(prev => [...txs, ...prev]);
    setLastAction(null); // can't undo bulk import
    setCurrentPage(1);
  }

  const ctx: BankingContextType = {
    balance,
    transactions,
    filter,
    currentPage,
    lastAction,
    editingTransaction,
    reuseTransaction,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    setFilter,
    resetFilter,
    setPage: setCurrentPage,
    undo,
    setEditingTransaction,
    setReuseTransaction,
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
