import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithBanking } from '../../test-utils';
import TransactionForm from './TransactionForm';

describe('TransactionForm', () => {
  describe('initial state', () => {
    it('should render add button when form is closed', () => {
      renderWithBanking(<TransactionForm />);

      expect(screen.getByRole('button', { name: /new transaction/i })).toBeInTheDocument();
    });

    it('should not show form initially', () => {
      renderWithBanking(<TransactionForm />);

      expect(screen.queryByRole('form')).not.toBeInTheDocument();
      expect(screen.queryByText(/type/i)).not.toBeInTheDocument();
    });
  });

  describe('opening form', () => {
    it('should show form when add button is clicked', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));

      expect(screen.getByText(/new transaction/i, { selector: 'h3' })).toBeInTheDocument();
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should have deposit selected by default', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));

      const typeSelect = screen.getByLabelText(/type/i) as HTMLSelectElement;
      expect(typeSelect.value).toBe('deposit');
    });

    it('should have today date selected by default', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput.value).toBe(today);
    });
  });

  describe('form validation', () => {
    it('should show error for empty amount', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));
      await user.type(screen.getByLabelText(/description/i), 'Test description');
      await user.click(screen.getByRole('button', { name: /add/i }));

      expect(screen.getByText(/please enter a valid amount/i)).toBeInTheDocument();
    });

    it('should validate amount is required and positive via HTML5 constraints', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));

      const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
      // Check HTML5 validation constraints that prevent zero/negative
      expect(amountInput.min).toBe('0.01');
      expect(amountInput.step).toBe('0.01');
      expect(amountInput.type).toBe('number');
      expect(amountInput.required).toBeFalsy(); // Custom validation, not HTML5 required
    });

    it('should have min attribute on amount input to prevent negative values', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));

      const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
      expect(amountInput.min).toBe('0.01');
      expect(amountInput.type).toBe('number');
    });

    it('should show error for empty description', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));
      await user.type(screen.getByLabelText(/amount/i), '100');
      await user.click(screen.getByRole('button', { name: /add/i }));

      expect(screen.getByText(/please enter a description/i)).toBeInTheDocument();
    });

    it('should show error for whitespace-only description', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));
      await user.type(screen.getByLabelText(/amount/i), '100');
      await user.type(screen.getByLabelText(/description/i), '   ');
      await user.click(screen.getByRole('button', { name: /add/i }));

      expect(screen.getByText(/please enter a description/i)).toBeInTheDocument();
    });
  });

  describe('successful submission', () => {
    it('should close form after successful deposit submission', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));
      await user.type(screen.getByLabelText(/amount/i), '100');
      await user.type(screen.getByLabelText(/description/i), 'Test deposit');
      await user.click(screen.getByRole('button', { name: /add/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /new transaction/i })).toBeInTheDocument();
      });
    });

    it('should allow changing transaction type', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));
      await user.selectOptions(screen.getByLabelText(/type/i), 'withdrawal');

      const typeSelect = screen.getByLabelText(/type/i) as HTMLSelectElement;
      expect(typeSelect.value).toBe('withdrawal');
    });

    it('should allow changing date', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));

      const dateInput = screen.getByLabelText(/date/i);
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

      expect((dateInput as HTMLInputElement).value).toBe('2024-01-15');
    });
  });

  describe('cancel button', () => {
    it('should close form when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));
      expect(screen.getByText(/new transaction/i, { selector: 'h3' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.queryByText(/new transaction/i, { selector: 'h3' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /new transaction/i })).toBeInTheDocument();
    });

    it('should reset form fields when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));
      await user.type(screen.getByLabelText(/amount/i), '100');
      await user.type(screen.getByLabelText(/description/i), 'Test');
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await user.click(screen.getByRole('button', { name: /new transaction/i }));

      expect((screen.getByLabelText(/amount/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/description/i) as HTMLInputElement).value).toBe('');
    });
  });

  describe('withdrawal validation', () => {
    it('should show error when withdrawal exceeds balance', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));
      await user.selectOptions(screen.getByLabelText(/type/i), 'withdrawal');
      await user.type(screen.getByLabelText(/amount/i), '999999999');
      await user.type(screen.getByLabelText(/description/i), 'Too large');
      await user.click(screen.getByRole('button', { name: /add/i }));

      expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
    });
  });

  describe('form inputs', () => {
    it('should have correct input attributes', async () => {
      const user = userEvent.setup();
      renderWithBanking(<TransactionForm />);

      await user.click(screen.getByRole('button', { name: /new transaction/i }));

      const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
      expect(amountInput.type).toBe('number');
      expect(amountInput.step).toBe('0.01');
      expect(amountInput.min).toBe('0.01');

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
      expect(dateInput.type).toBe('date');

      const descInput = screen.getByLabelText(/description/i) as HTMLInputElement;
      expect(descInput.type).toBe('text');
    });
  });
});
