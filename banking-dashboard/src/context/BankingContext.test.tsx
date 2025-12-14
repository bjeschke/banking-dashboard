import { renderHook, act } from '@testing-library/react';
import { BankingProvider, useBanking } from './BankingContext';
import { Transaction } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BankingProvider>{children}</BankingProvider>
);

describe('BankingContext', () => {
  describe('useBanking hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useBanking());
      }).toThrow('useBanking must be used within BankingProvider');

      consoleSpy.mockRestore();
    });

    it('should provide initial state', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      expect(result.current.balance).toBeDefined();
      expect(result.current.transactions).toBeDefined();
      expect(Array.isArray(result.current.transactions)).toBe(true);
      expect(result.current.filter).toEqual({
        type: 'all',
        dateFrom: '',
        dateTo: '',
        searchTerm: '',
      });
      expect(result.current.currentPage).toBe(1);
      expect(result.current.lastAction).toBeNull();
      expect(result.current.editingTransaction).toBeNull();
      expect(result.current.reuseTransaction).toBeNull();
    });
  });

  describe('addTransaction', () => {
    it('should add a deposit transaction and update balance', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });
      const initialBalance = result.current.balance;
      const initialCount = result.current.transactions.length;

      const newTransaction: Transaction = {
        id: 'test-1',
        type: 'deposit',
        amount: 100,
        description: 'Test deposit',
        date: '2024-12-14',
      };

      act(() => {
        const error = result.current.addTransaction(newTransaction);
        expect(error).toBeNull();
      });

      expect(result.current.balance).toBe(initialBalance + 100);
      expect(result.current.transactions.length).toBe(initialCount + 1);
      expect(result.current.transactions[0]).toEqual(newTransaction);
    });

    it('should add a withdrawal transaction and update balance', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });
      const initialBalance = result.current.balance;

      const newTransaction: Transaction = {
        id: 'test-2',
        type: 'withdrawal',
        amount: 50,
        description: 'Test withdrawal',
        date: '2024-12-14',
      };

      act(() => {
        const error = result.current.addTransaction(newTransaction);
        expect(error).toBeNull();
      });

      expect(result.current.balance).toBe(initialBalance - 50);
    });

    it('should reject withdrawal exceeding balance', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });
      const initialBalance = result.current.balance;

      const largeWithdrawal: Transaction = {
        id: 'test-3',
        type: 'withdrawal',
        amount: initialBalance + 1000,
        description: 'Too large',
        date: '2024-12-14',
      };

      act(() => {
        const error = result.current.addTransaction(largeWithdrawal);
        expect(error).toContain('Insufficient balance');
      });

      expect(result.current.balance).toBe(initialBalance);
    });

    it('should record lastAction for undo', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      const newTransaction: Transaction = {
        id: 'test-4',
        type: 'deposit',
        amount: 100,
        description: 'Test',
        date: '2024-12-14',
      };

      act(() => {
        result.current.addTransaction(newTransaction);
      });

      expect(result.current.lastAction).not.toBeNull();
      expect(result.current.lastAction?.type).toBe('add');
    });

    it('should reset page to 1 after adding transaction', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      act(() => {
        result.current.setPage(5);
      });

      const newTransaction: Transaction = {
        id: 'test-5',
        type: 'deposit',
        amount: 100,
        description: 'Test',
        date: '2024-12-14',
      };

      act(() => {
        result.current.addTransaction(newTransaction);
      });

      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction and reverse balance for deposit', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      const deposit: Transaction = {
        id: 'delete-test-1',
        type: 'deposit',
        amount: 100,
        description: 'To delete',
        date: '2024-12-14',
      };

      act(() => {
        result.current.addTransaction(deposit);
      });

      const balanceAfterAdd = result.current.balance;

      act(() => {
        result.current.deleteTransaction('delete-test-1');
      });

      expect(result.current.balance).toBe(balanceAfterAdd - 100);
      expect(result.current.transactions.find(t => t.id === 'delete-test-1')).toBeUndefined();
    });

    it('should delete transaction and reverse balance for withdrawal', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      const withdrawal: Transaction = {
        id: 'delete-test-2',
        type: 'withdrawal',
        amount: 50,
        description: 'To delete',
        date: '2024-12-14',
      };

      act(() => {
        result.current.addTransaction(withdrawal);
      });

      const balanceAfterAdd = result.current.balance;

      act(() => {
        result.current.deleteTransaction('delete-test-2');
      });

      expect(result.current.balance).toBe(balanceAfterAdd + 50);
    });

    it('should do nothing if transaction not found', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });
      const initialBalance = result.current.balance;
      const initialCount = result.current.transactions.length;

      act(() => {
        result.current.deleteTransaction('nonexistent-id');
      });

      expect(result.current.balance).toBe(initialBalance);
      expect(result.current.transactions.length).toBe(initialCount);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction amount and recalculate balance', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      const original: Transaction = {
        id: 'update-test-1',
        type: 'deposit',
        amount: 100,
        description: 'Original',
        date: '2024-12-14',
      };

      act(() => {
        result.current.addTransaction(original);
      });

      const balanceAfterAdd = result.current.balance;

      const updated: Transaction = {
        ...original,
        amount: 150,
        description: 'Updated',
      };

      act(() => {
        const error = result.current.updateTransaction(updated);
        expect(error).toBeNull();
      });

      expect(result.current.balance).toBe(balanceAfterAdd + 50);
      expect(result.current.transactions.find(t => t.id === 'update-test-1')?.description).toBe('Updated');
    });

    it('should reject update that would cause negative balance', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      const deposit: Transaction = {
        id: 'update-test-2',
        type: 'deposit',
        amount: 100,
        description: 'Test',
        date: '2024-12-14',
      };

      act(() => {
        result.current.addTransaction(deposit);
      });

      const updatedToWithdrawal: Transaction = {
        ...deposit,
        type: 'withdrawal',
        amount: result.current.balance + 1000,
      };

      act(() => {
        const error = result.current.updateTransaction(updatedToWithdrawal);
        expect(error).toContain('negative balance');
      });
    });

    it('should return error if transaction not found', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      act(() => {
        const error = result.current.updateTransaction({
          id: 'nonexistent',
          type: 'deposit',
          amount: 100,
          description: 'Test',
          date: '2024-12-14',
        });
        expect(error).toBe('Transaction not found');
      });
    });

    it('should clear editingTransaction after update', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      const transaction: Transaction = {
        id: 'update-test-3',
        type: 'deposit',
        amount: 100,
        description: 'Test',
        date: '2024-12-14',
      };

      act(() => {
        result.current.addTransaction(transaction);
        result.current.setEditingTransaction(transaction);
      });

      expect(result.current.editingTransaction).not.toBeNull();

      act(() => {
        result.current.updateTransaction({ ...transaction, amount: 150 });
      });

      expect(result.current.editingTransaction).toBeNull();
    });
  });

  describe('undo', () => {
    it('should undo add transaction', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });
      const initialBalance = result.current.balance;
      const initialCount = result.current.transactions.length;

      const transaction: Transaction = {
        id: 'undo-test-1',
        type: 'deposit',
        amount: 100,
        description: 'To undo',
        date: '2024-12-14',
      };

      act(() => {
        result.current.addTransaction(transaction);
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.balance).toBe(initialBalance);
      expect(result.current.transactions.length).toBe(initialCount);
      expect(result.current.lastAction).toBeNull();
    });

    it('should undo delete transaction', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      const transaction: Transaction = {
        id: 'undo-test-2',
        type: 'deposit',
        amount: 100,
        description: 'To delete then undo',
        date: '2024-12-14',
      };

      act(() => {
        result.current.addTransaction(transaction);
      });

      const balanceAfterAdd = result.current.balance;

      act(() => {
        result.current.deleteTransaction('undo-test-2');
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.balance).toBe(balanceAfterAdd);
      expect(result.current.transactions.find(t => t.id === 'undo-test-2')).toBeDefined();
    });

    it('should do nothing if no lastAction', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });
      const initialBalance = result.current.balance;

      act(() => {
        result.current.undo();
      });

      expect(result.current.balance).toBe(initialBalance);
    });
  });

  describe('filter operations', () => {
    it('should update filter partially', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      act(() => {
        result.current.setFilter({ searchTerm: 'test' });
      });

      expect(result.current.filter.searchTerm).toBe('test');
      expect(result.current.filter.type).toBe('all');
    });

    it('should reset filter to defaults', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      act(() => {
        result.current.setFilter({
          type: 'deposit',
          searchTerm: 'test',
          dateFrom: '2024-01-01',
        });
      });

      act(() => {
        result.current.resetFilter();
      });

      expect(result.current.filter).toEqual({
        type: 'all',
        dateFrom: '',
        dateTo: '',
        searchTerm: '',
      });
    });

    it('should reset page to 1 when filter changes', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      act(() => {
        result.current.setPage(5);
      });

      act(() => {
        result.current.setFilter({ searchTerm: 'test' });
      });

      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('pagination', () => {
    it('should update current page', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      act(() => {
        result.current.setPage(3);
      });

      expect(result.current.currentPage).toBe(3);
    });
  });

  describe('editing and reuse', () => {
    it('should set and clear editing transaction', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      const transaction: Transaction = {
        id: 'edit-test',
        type: 'deposit',
        amount: 100,
        description: 'Test',
        date: '2024-12-14',
      };

      act(() => {
        result.current.setEditingTransaction(transaction);
      });

      expect(result.current.editingTransaction).toEqual(transaction);

      act(() => {
        result.current.setEditingTransaction(null);
      });

      expect(result.current.editingTransaction).toBeNull();
    });

    it('should set and clear reuse transaction', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      const transaction: Transaction = {
        id: 'reuse-test',
        type: 'deposit',
        amount: 100,
        description: 'Test',
        date: '2024-12-14',
      };

      act(() => {
        result.current.setReuseTransaction(transaction);
      });

      expect(result.current.reuseTransaction).toEqual(transaction);

      act(() => {
        result.current.setReuseTransaction(null);
      });

      expect(result.current.reuseTransaction).toBeNull();
    });
  });

  describe('importTransactions', () => {
    it('should import transactions and update balance', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });
      const initialBalance = result.current.balance;
      const initialCount = result.current.transactions.length;

      const imports: Transaction[] = [
        { id: 'import-1', type: 'deposit', amount: 200, description: 'Import 1', date: '2024-12-14' },
        { id: 'import-2', type: 'withdrawal', amount: 50, description: 'Import 2', date: '2024-12-13' },
      ];

      act(() => {
        result.current.importTransactions(imports);
      });

      expect(result.current.balance).toBe(initialBalance + 150);
      expect(result.current.transactions.length).toBe(initialCount + 2);
    });

    it('should clear lastAction after import', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      act(() => {
        result.current.addTransaction({
          id: 'pre-import',
          type: 'deposit',
          amount: 100,
          description: 'Before import',
          date: '2024-12-14',
        });
      });

      expect(result.current.lastAction).not.toBeNull();

      act(() => {
        result.current.importTransactions([]);
      });

      expect(result.current.lastAction).toBeNull();
    });

    it('should reset page to 1 after import', () => {
      const { result } = renderHook(() => useBanking(), { wrapper });

      act(() => {
        result.current.setPage(5);
      });

      act(() => {
        result.current.importTransactions([]);
      });

      expect(result.current.currentPage).toBe(1);
    });
  });
});
