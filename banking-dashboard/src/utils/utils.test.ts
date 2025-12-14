import {
  generateId,
  formatCurrency,
  formatDate,
  getTodayDate,
  filterTransactions,
  sortByDate,
  saveToStorage,
  loadFromStorage,
  parseCSV,
  exportToCSV,
  downloadFile,
} from './index';
import { Transaction, TransactionFilter } from '../types';

describe('generateId', () => {
  it('should generate a unique ID with txn prefix', () => {
    const id = generateId();
    expect(id).toMatch(/^txn-\d+-[a-z0-9]+$/);
  });

  it('should generate different IDs on subsequent calls', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('formatCurrency', () => {
  it('should format positive numbers as EUR currency', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1234,56');
    expect(result).toContain('€');
  });

  it('should format zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0,00');
  });

  it('should format negative numbers', () => {
    const result = formatCurrency(-100);
    expect(result).toContain('100,00');
  });

  it('should handle large numbers', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1.000.000,00');
  });
});

describe('formatDate', () => {
  it('should format ISO date string to Spanish locale', () => {
    const result = formatDate('2024-12-14');
    expect(result).toBe('14/12/2024');
  });

  it('should handle different dates', () => {
    const result = formatDate('2024-01-01');
    expect(result).toBe('01/01/2024');
  });
});

describe('getTodayDate', () => {
  it('should return date in YYYY-MM-DD format', () => {
    const result = getTodayDate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return current date', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getTodayDate()).toBe(today);
  });
});

describe('filterTransactions', () => {
  const mockTransactions: Transaction[] = [
    { id: '1', type: 'deposit', amount: 100, description: 'Salary', date: '2024-12-10' },
    { id: '2', type: 'withdrawal', amount: 50, description: 'Groceries', date: '2024-12-11' },
    { id: '3', type: 'deposit', amount: 200, description: 'Bonus', date: '2024-12-12' },
    { id: '4', type: 'withdrawal', amount: 30, description: 'Coffee', date: '2024-12-13' },
  ];

  const defaultFilter: TransactionFilter = {
    type: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  };

  it('should return all transactions with default filter', () => {
    const result = filterTransactions(mockTransactions, defaultFilter);
    expect(result).toHaveLength(4);
  });

  it('should filter by type - deposits only', () => {
    const result = filterTransactions(mockTransactions, { ...defaultFilter, type: 'deposit' });
    expect(result).toHaveLength(2);
    expect(result.every(t => t.type === 'deposit')).toBe(true);
  });

  it('should filter by type - withdrawals only', () => {
    const result = filterTransactions(mockTransactions, { ...defaultFilter, type: 'withdrawal' });
    expect(result).toHaveLength(2);
    expect(result.every(t => t.type === 'withdrawal')).toBe(true);
  });

  it('should filter by dateFrom', () => {
    const result = filterTransactions(mockTransactions, { ...defaultFilter, dateFrom: '2024-12-12' });
    expect(result).toHaveLength(2);
    expect(result.map(t => t.id)).toEqual(['3', '4']);
  });

  it('should filter by dateTo', () => {
    const result = filterTransactions(mockTransactions, { ...defaultFilter, dateTo: '2024-12-11' });
    expect(result).toHaveLength(2);
    expect(result.map(t => t.id)).toEqual(['1', '2']);
  });

  it('should filter by date range', () => {
    const result = filterTransactions(mockTransactions, {
      ...defaultFilter,
      dateFrom: '2024-12-11',
      dateTo: '2024-12-12',
    });
    expect(result).toHaveLength(2);
    expect(result.map(t => t.id)).toEqual(['2', '3']);
  });

  it('should filter by searchTerm (case-insensitive)', () => {
    const result = filterTransactions(mockTransactions, { ...defaultFilter, searchTerm: 'sal' });
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Salary');
  });

  it('should combine multiple filters', () => {
    const result = filterTransactions(mockTransactions, {
      type: 'deposit',
      dateFrom: '2024-12-11',
      dateTo: '',
      searchTerm: '',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('should return empty array if no matches', () => {
    const result = filterTransactions(mockTransactions, { ...defaultFilter, searchTerm: 'nonexistent' });
    expect(result).toHaveLength(0);
  });
});

describe('sortByDate', () => {
  const unsortedTransactions: Transaction[] = [
    { id: '1', type: 'deposit', amount: 100, description: 'First', date: '2024-12-10' },
    { id: '2', type: 'deposit', amount: 200, description: 'Third', date: '2024-12-12' },
    { id: '3', type: 'deposit', amount: 150, description: 'Second', date: '2024-12-11' },
  ];

  it('should sort transactions by date descending (newest first)', () => {
    const result = sortByDate(unsortedTransactions);
    expect(result.map(t => t.id)).toEqual(['2', '3', '1']);
  });

  it('should not mutate original array', () => {
    const original = [...unsortedTransactions];
    sortByDate(unsortedTransactions);
    expect(unsortedTransactions).toEqual(original);
  });

  it('should handle empty array', () => {
    const result = sortByDate([]);
    expect(result).toEqual([]);
  });
});

describe('saveToStorage / loadFromStorage', () => {
  it('should save and load balance and transactions', () => {
    const balance = 1000;
    const transactions: Transaction[] = [
      { id: '1', type: 'deposit', amount: 100, description: 'Test', date: '2024-12-14' },
    ];

    saveToStorage(balance, transactions);
    const loaded = loadFromStorage();

    expect(loaded).not.toBeNull();
    expect(loaded!.balance).toBe(balance);
    expect(loaded!.transactions).toEqual(transactions);
  });

  it('should return null if no data in storage', () => {
    const result = loadFromStorage();
    expect(result).toBeNull();
  });

  it('should overwrite existing data', () => {
    saveToStorage(100, []);
    saveToStorage(200, [{ id: '1', type: 'deposit', amount: 50, description: 'New', date: '2024-12-14' }]);

    const loaded = loadFromStorage();
    expect(loaded!.balance).toBe(200);
    expect(loaded!.transactions).toHaveLength(1);
  });
});

describe('parseCSV', () => {
  it('should parse valid CSV content', () => {
    const csv = `Date,Amount,Description,Type
2024-12-14,100.00,Salary,Deposit
2024-12-13,50.00,Groceries,Withdrawal`;

    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2024-12-14');
    expect(result[0].amount).toBe(100);
    expect(result[0].description).toBe('Salary');
    expect(result[0].type).toBe('deposit');
    expect(result[1].type).toBe('withdrawal');
  });

  it('should handle negative amounts (take absolute value)', () => {
    const csv = `Date,Amount,Description,Type
2024-12-14,-50.00,Refund,Deposit`;

    const result = parseCSV(csv);
    expect(result[0].amount).toBe(50);
  });

  it('should skip invalid rows', () => {
    const csv = `Date,Amount,Description,Type
2024-12-14,100.00,Salary,Deposit
invalid,row
2024-12-13,50.00,Groceries,Withdrawal`;

    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
  });

  it('should throw error for CSV with only header', () => {
    const csv = 'Date,Amount,Description,Type';
    expect(() => parseCSV(csv)).toThrow('Invalid CSV file');
  });

  it('should generate unique IDs for imported transactions', () => {
    const csv = `Date,Amount,Description,Type
2024-12-14,100.00,Test1,Deposit
2024-12-13,50.00,Test2,Withdrawal`;

    const result = parseCSV(csv);
    expect(result[0].id).not.toBe(result[1].id);
    expect(result[0].id).toMatch(/^txn-/);
  });
});

describe('exportToCSV', () => {
  it('should export transactions to CSV format', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'deposit', amount: 100, description: 'Salary', date: '2024-12-14' },
      { id: '2', type: 'withdrawal', amount: 50, description: 'Groceries', date: '2024-12-13' },
    ];

    const result = exportToCSV(transactions);
    const lines = result.split('\n');

    expect(lines[0]).toBe('Date,Amount,Description,Type');
    expect(lines[1]).toBe('2024-12-14,100.00,Salary,Deposit');
    expect(lines[2]).toBe('2024-12-13,-50.00,Groceries,Withdrawal');
  });

  it('should handle empty transactions array', () => {
    const result = exportToCSV([]);
    expect(result).toBe('Date,Amount,Description,Type');
  });
});

describe('downloadFile', () => {
  it('should create blob and trigger download', () => {
    const mockClick = jest.fn();
    const mockCreateElement = jest.spyOn(document, 'createElement');

    mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement);

    downloadFile('test content', 'test.csv');

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    mockCreateElement.mockRestore();
  });
});
