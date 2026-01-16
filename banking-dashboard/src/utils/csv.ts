import { Transaction } from '../types';
import { generateId } from './id';

// CSV parsing and export utilities

export interface CSVParseResult {
  transactions: Transaction[];
  errors: string[];
}

export function parseCSV(content: string): CSVParseResult {
  const lines = content.trim().split('\n');
  const errors: string[] = [];
  const transactions: Transaction[] = [];

  if (lines.length < 2) {
    errors.push('Invalid CSV file: must contain a header row and at least one data row');
    return { transactions, errors };
  }

  // skip header row
  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i].trim();

    if (!line) {
      continue; // Skip empty lines
    }

    const parts = line.split(',').map(s => s.trim());
    const [date, amountStr, desc, typeStr] = parts;

    // Validate required fields
    if (!date) {
      errors.push(`Row ${lineNum}: Missing date`);
      continue;
    }
    if (!amountStr) {
      errors.push(`Row ${lineNum}: Missing amount`);
      continue;
    }
    if (!desc) {
      errors.push(`Row ${lineNum}: Missing description`);
      continue;
    }
    if (!typeStr) {
      errors.push(`Row ${lineNum}: Missing type`);
      continue;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      errors.push(`Row ${lineNum}: Invalid date format "${date}" (expected YYYY-MM-DD)`);
      continue;
    }

    // Validate amount
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      errors.push(`Row ${lineNum}: Invalid amount "${amountStr}"`);
      continue;
    }

    // Validate type
    const normalizedType = typeStr.toLowerCase();
    if (normalizedType !== 'deposit' && normalizedType !== 'withdrawal') {
      errors.push(`Row ${lineNum}: Invalid type "${typeStr}" (expected "deposit" or "withdrawal")`);
      continue;
    }

    transactions.push({
      id: generateId(),
      date,
      amount: Math.abs(amount),
      description: desc,
      type: normalizedType as 'deposit' | 'withdrawal',
    });
  }

  return { transactions, errors };
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

export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  // cleanup
  URL.revokeObjectURL(url);
}
