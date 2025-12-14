import { Transaction, TransactionFilter } from '../types';
import { getLocale, LocaleConfig } from '../config';

// quick id generator - timestamp + random should be unique enough for our use case
export function generateId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatCurrency(amount: number, override?: LocaleConfig): string {
  const cfg = override || getLocale();
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.currency,
  }).format(amount);
}

export function formatDate(dateStr: string, override?: LocaleConfig): string {
  const cfg = override || getLocale();
  return new Date(dateStr).toLocaleDateString(cfg.locale, cfg.dateFormat);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

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

// storage stuff
const STORAGE_KEY = 'banking_dashboard';

export function saveToStorage(balance: number, transactions: Transaction[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, transactions }));
  } catch (e) {
    // storage full or private mode, just ignore
  }
}

export function loadFromStorage(): { balance: number; transactions: Transaction[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// csv handling
export function parseCSV(content: string): Transaction[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) throw new Error('Invalid CSV file');

  const result: Transaction[] = [];

  // skip header row
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(s => s.trim());
    const [date, amountStr, desc, typeStr] = parts;

    if (!date || !amountStr || !desc || !typeStr) continue;

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) continue;

    result.push({
      id: generateId(),
      date,
      amount: Math.abs(amount),
      description: desc,
      type: typeStr.toLowerCase() === 'deposit' ? 'deposit' : 'withdrawal',
    });
  }

  return result;
}

export function exportToCSV(txns: Transaction[]): string {
  const header = 'Date,Amount,Description,Type';
  const rows = txns.map(t => {
    const amt = t.type === 'withdrawal' ? -t.amount : t.amount;
    const label = t.type === 'deposit' ? 'Deposit' : 'Withdrawal';
    return `${t.date},${amt.toFixed(2)},${t.description},${label}`;
  });
  return [header, ...rows].join('\n');
}

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  // cleanup
  URL.revokeObjectURL(url);
}
