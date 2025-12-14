export type TransactionType = 'deposit' | 'withdrawal';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
}

export interface TransactionFilter {
  type: TransactionType | 'all';
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}
