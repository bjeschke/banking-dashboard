import { Transaction } from '../types';

export interface TransactionResult {
  success: boolean;
  error: string | null;
  delta: number;
}

export interface UpdateResult {
  success: boolean;
  error: string | null;
  newBalance: number;
}

export function validateAddTransaction(
  transaction: Transaction,
  currentBalance: number
): TransactionResult {
  if (transaction.type === 'withdrawal' && transaction.amount > currentBalance) {
    return {
      success: false,
      error: `Insufficient balance. Available: ${currentBalance.toFixed(2)} EUR`,
      delta: 0,
    };
  }

  const delta = transaction.type === 'deposit' ? transaction.amount : -transaction.amount;

  return {
    success: true,
    error: null,
    delta,
  };
}

export function validateUpdateTransaction(
  newTransaction: Transaction,
  oldTransaction: Transaction,
  currentBalance: number
): UpdateResult {
  // Remove old effect, add new effect
  let newBalance = currentBalance;
  newBalance += oldTransaction.type === 'deposit' ? -oldTransaction.amount : oldTransaction.amount;
  newBalance += newTransaction.type === 'deposit' ? newTransaction.amount : -newTransaction.amount;

  if (newBalance < 0) {
    return {
      success: false,
      error: `This would result in negative balance: ${newBalance.toFixed(2)} EUR`,
      newBalance: currentBalance,
    };
  }

  return {
    success: true,
    error: null,
    newBalance,
  };
}

export function calculateImportDelta(transactions: Transaction[]): number {
  return transactions.reduce(
    (sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount),
    0
  );
}
