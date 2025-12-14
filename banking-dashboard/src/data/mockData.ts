import { Transaction } from '../types';

export const INITIAL_BALANCE = 5847.32;

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'deposit',
    amount: 3500.00,
    description: 'Salary',
    date: '2025-12-01',
  },
  {
    id: 'txn-2',
    type: 'withdrawal',
    amount: 89.99,
    description: 'Amazon Order',
    date: '2025-12-02',
  },
  {
    id: 'txn-3',
    type: 'withdrawal',
    amount: 45.50,
    description: 'Grocery Shopping',
    date: '2025-12-03',
  },
  {
    id: 'txn-4',
    type: 'withdrawal',
    amount: 120.00,
    description: 'Electricity Bill',
    date: '2025-12-04',
  },
  {
    id: 'txn-5',
    type: 'withdrawal',
    amount: 250.00,
    description: 'Rent Share',
    date: '2025-12-05',
  },
  {
    id: 'txn-6',
    type: 'withdrawal',
    amount: 14.99,
    description: 'Netflix Subscription',
    date: '2025-12-06',
  },
  {
    id: 'txn-7',
    type: 'deposit',
    amount: 150.00,
    description: 'Refund',
    date: '2025-12-07',
  },
  {
    id: 'txn-8',
    type: 'withdrawal',
    amount: 32.80,
    description: 'Restaurant',
    date: '2025-12-08',
  },
  {
    id: 'txn-9',
    type: 'withdrawal',
    amount: 199.00,
    description: 'Electronics Store',
    date: '2025-12-09',
  },
  {
    id: 'txn-10',
    type: 'deposit',
    amount: 500.00,
    description: 'Freelance Payment',
    date: '2025-12-10',
  },
  {
    id: 'txn-11',
    type: 'withdrawal',
    amount: 65.00,
    description: 'Gas Station',
    date: '2025-12-11',
  },
  {
    id: 'txn-12',
    type: 'withdrawal',
    amount: 25.99,
    description: 'Book Store',
    date: '2025-12-12',
  },
  {
    id: 'txn-13',
    type: 'withdrawal',
    amount: 55.00,
    description: 'Internet Bill',
    date: '2025-12-14',
  },
];
