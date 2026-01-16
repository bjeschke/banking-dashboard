import { Transaction } from '../types';

// Local storage persistence utilities

const STORAGE_KEY = 'banking_dashboard';

export function saveToStorage(balance: number, transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, transactions }));
  } catch {
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
