import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithBanking } from '../../test-utils';
import CSVManager from './CSVManager';

// Mock File.text() for testing
const createMockFile = (content: string, name: string): File => {
  const file = new File([content], name, { type: 'text/csv' });
  file.text = jest.fn().mockResolvedValue(content);
  return file;
};

describe('CSVManager', () => {
  describe('rendering', () => {
    it('should render import/export heading', () => {
      renderWithBanking(<CSVManager />);

      expect(screen.getByRole('heading', { name: /import.*export/i })).toBeInTheDocument();
    });

    it('should render import button', () => {
      renderWithBanking(<CSVManager />);

      expect(screen.getByRole('button', { name: /import csv/i })).toBeInTheDocument();
    });

    it('should render export button', () => {
      renderWithBanking(<CSVManager />);

      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
    });

    it('should have hidden file input', () => {
      renderWithBanking(<CSVManager />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.style.display).toBe('none');
      expect(fileInput.accept).toBe('.csv');
    });
  });

  describe('export functionality', () => {
    it('should trigger download when export is clicked', async () => {
      const user = userEvent.setup();
      renderWithBanking(<CSVManager />);

      await user.click(screen.getByRole('button', { name: /export csv/i }));

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should show success message after export', async () => {
      const user = userEvent.setup();
      renderWithBanking(<CSVManager />);

      await user.click(screen.getByRole('button', { name: /export csv/i }));

      await waitFor(() => {
        expect(screen.getByText(/exported successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('import functionality', () => {
    it('should trigger file input when import button clicked', async () => {
      const user = userEvent.setup();
      renderWithBanking(<CSVManager />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click');

      await user.click(screen.getByRole('button', { name: /import csv/i }));

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should show success message after importing valid CSV', async () => {
      renderWithBanking(<CSVManager />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const csvContent = `Date,Amount,Description,Type
2024-12-14,100.00,Test Import,Deposit`;

      const file = createMockFile(csvContent, 'test.csv');

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/imported.*transaction/i)).toBeInTheDocument();
      });
    });

    it('should show error message for invalid CSV', async () => {
      renderWithBanking(<CSVManager />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const invalidCsv = 'invalid csv content';
      const file = createMockFile(invalidCsv, 'invalid.csv');

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid csv|no valid transactions/i)).toBeInTheDocument();
      });
    });

    it('should show error when no valid transactions found', async () => {
      renderWithBanking(<CSVManager />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const emptyDataCsv = `Date,Amount,Description,Type
invalid,data,here,too`;

      const file = createMockFile(emptyDataCsv, 'empty.csv');

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/no valid transactions|invalid/i)).toBeInTheDocument();
      });
    });

    it('should clear file input after import', async () => {
      renderWithBanking(<CSVManager />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const csvContent = `Date,Amount,Description,Type
2024-12-14,100.00,Test,Deposit`;

      const file = createMockFile(csvContent, 'test.csv');

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(fileInput.value).toBe('');
      });
    });

    it('should handle multiple transactions in CSV', async () => {
      renderWithBanking(<CSVManager />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const csvContent = `Date,Amount,Description,Type
2024-12-14,100.00,First,Deposit
2024-12-13,50.00,Second,Withdrawal
2024-12-12,75.00,Third,Deposit`;

      const file = createMockFile(csvContent, 'multi.csv');

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/imported 3 transactions/i)).toBeInTheDocument();
      });
    });

    it('should do nothing when no file selected', async () => {
      renderWithBanking(<CSVManager />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(screen.queryByText(/imported/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('message display', () => {
    it('should show success message with correct class', async () => {
      const user = userEvent.setup();
      renderWithBanking(<CSVManager />);

      await user.click(screen.getByRole('button', { name: /export csv/i }));

      await waitFor(() => {
        const message = screen.getByText(/exported successfully/i);
        expect(message).toHaveClass('success');
      });
    });

    it('should show error message with correct class', async () => {
      renderWithBanking(<CSVManager />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const invalidCsv = 'just one line';
      const file = createMockFile(invalidCsv, 'bad.csv');

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        const message = document.querySelector('.error');
        expect(message).toBeInTheDocument();
      });
    });
  });
});
