import { Transaction, TransactionFilter } from '../types';

// Transaction filtering and sorting utilities

export function filterTransactions(txns: Transaction[], f: TransactionFilter): Transaction[] {
  return txns.filter(t => {
    if (f.type !== 'all' && t.type !== f.type) return false;
    if (f.dateFrom && t.date < f.dateFrom) return false;
    if (f.dateTo && t.date > f.dateTo) return false;
    if (f.searchTerm) {
      const search = f.searchTerm.toLowerCase();
      if (!t.description.toLowerCase().includes(search)) return false;
    }
    return true;
  });
}

export function sortByDate(txns: Transaction[]): Transaction[] {
  return [...txns].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
