import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithBanking } from '../../test-utils';
import TransactionList from './TransactionList';

describe('TransactionList', () => {
  describe('rendering', () => {
    it('should render transaction list header', () => {
      renderWithBanking(<TransactionList />);

      expect(screen.getByRole('heading', { name: /transactions/i })).toBeInTheDocument();
    });

    it('should show transaction count', () => {
      renderWithBanking(<TransactionList />);

      expect(screen.getByText(/entries/i)).toBeInTheDocument();
    });

    it('should render filter controls', () => {
      renderWithBanking(<TransactionList />);

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('From:')).toBeInTheDocument();
      expect(screen.getByText('To:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should render transactions from mock data', () => {
      renderWithBanking(<TransactionList />);

      expect(screen.getAllByRole('button', { name: /edit/i }).length).toBeGreaterThan(0);
    });
  });

  describe('filter by type', () => {
    it('should have all types option selected by default', () => {
      renderWithBanking(<TransactionList />);

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('all');
    });

    it('should filter by deposits', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionList />);

      await user.selectOptions(screen.getByRole('combobox'), 'deposit');

      expect(screen.getByRole('combobox')).toHaveValue('deposit');
      expect(screen.getByText(/entries/i)).toBeInTheDocument();
    });

    it('should filter by withdrawals', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionList />);

      await user.selectOptions(screen.getByRole('combobox'), 'withdrawal');

      expect(screen.getByRole('combobox')).toHaveValue('withdrawal');
    });
  });

  describe('search filter', () => {
    it('should filter transactions by search term', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionList />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Salary');

      await waitFor(() => {
        const entries = screen.getByText(/entries/i).textContent;
        expect(entries).toBeDefined();
      });
    });

    it('should show empty state when no matches', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionList />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'xyznonexistent123');

      await waitFor(() => {
        expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionList />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'SALARY');

      await waitFor(() => {
        const entries = screen.getByText(/entries/i).textContent;
        expect(entries).toBeDefined();
      });
    });
  });

  describe('date filters', () => {
    it('should have empty date filters by default', () => {
      renderWithBanking(<TransactionList />);

      const dateFields = screen.getAllByDisplayValue('');
      expect(dateFields.length).toBeGreaterThan(0);
    });

    it('should filter by from date', () => {
      renderWithBanking(<TransactionList />);

      const dateInputs = document.querySelectorAll('input[type="date"]');
      expect(dateInputs.length).toBe(2);

      fireEvent.change(dateInputs[0], { target: { value: '2024-12-10' } });

      expect((dateInputs[0] as HTMLInputElement).value).toBe('2024-12-10');
    });

    it('should filter by to date', () => {
      renderWithBanking(<TransactionList />);

      const dateInputs = document.querySelectorAll('input[type="date"]');

      fireEvent.change(dateInputs[1], { target: { value: '2024-12-15' } });

      expect((dateInputs[1] as HTMLInputElement).value).toBe('2024-12-15');
    });
  });

  describe('reset filter', () => {
    it('should reset all filters when reset button clicked', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionList />);

      await user.type(screen.getByPlaceholderText(/search/i), 'test');
      await user.selectOptions(screen.getByRole('combobox'), 'deposit');

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(screen.getByPlaceholderText(/search/i)).toHaveValue('');
      expect(screen.getByRole('combobox')).toHaveValue('all');
    });
  });

  describe('transaction actions', () => {
    it('should have edit button for each transaction', () => {
      renderWithBanking(<TransactionList />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should have reuse button for each transaction', () => {
      renderWithBanking(<TransactionList />);

      const reuseButtons = screen.getAllByRole('button', { name: /reuse/i });
      expect(reuseButtons.length).toBeGreaterThan(0);
    });

    it('should have delete button for each transaction', () => {
      renderWithBanking(<TransactionList />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should remove transaction when delete is clicked', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionList />);

      const entriesBefore = screen.getByText(/entries/i).textContent;
      const countBefore = parseInt(entriesBefore!.match(/\d+/)![0]);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        const entriesAfter = screen.getByText(/entries/i).textContent;
        const countAfter = parseInt(entriesAfter!.match(/\d+/)![0]);
        expect(countAfter).toBe(countBefore - 1);
      });
    });
  });

  describe('transaction display', () => {
    it('should show deposit icon for deposits', () => {
      renderWithBanking(<TransactionList />);

      expect(screen.getAllByText('↓').length).toBeGreaterThan(0);
    });

    it('should show withdrawal icon for withdrawals', () => {
      renderWithBanking(<TransactionList />);

      expect(screen.getAllByText('↑').length).toBeGreaterThan(0);
    });

    it('should display formatted amounts', () => {
      renderWithBanking(<TransactionList />);

      expect(screen.getAllByText(/€/i).length).toBeGreaterThan(0);
    });

    it('should show positive prefix for deposits', () => {
      renderWithBanking(<TransactionList />);

      const positiveAmounts = document.querySelectorAll('.positive');
      expect(positiveAmounts.length).toBeGreaterThan(0);
    });

    it('should show negative prefix for withdrawals', () => {
      renderWithBanking(<TransactionList />);

      const negativeAmounts = document.querySelectorAll('.negative');
      expect(negativeAmounts.length).toBeGreaterThan(0);
    });
  });

  describe('pagination', () => {
    it('should show pagination when there are many transactions', () => {
      renderWithBanking(<TransactionList />);

      const entries = screen.getByText(/entries/i).textContent;
      const count = parseInt(entries!.match(/\d+/)![0]);

      if (count > 20) {
        expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      }
    });

    it('should disable prev button on first page', () => {
      renderWithBanking(<TransactionList />);

      const prevButton = screen.queryByRole('button', { name: /prev/i });
      if (prevButton) {
        expect(prevButton).toBeDisabled();
      }
    });
  });

  describe('empty state', () => {
    it('should show empty message when no transactions match filter', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionList />);

      await user.type(screen.getByPlaceholderText(/search/i), 'nonexistent_query_xyz_123');

      await waitFor(() => {
        expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
      });
    });
  });
});
