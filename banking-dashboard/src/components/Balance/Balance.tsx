import React from 'react';
import { useBanking } from '../../context/BankingContext';
import { formatCurrency } from '../../utils';
import { useExchangeRate, formatKes } from '../../services/exchangeRate';
import './Balance.css';

export default function Balance(): React.ReactElement {
  const { balance, transactions, lastAction, undo } = useBanking();
  const { toKes, loading } = useExchangeRate();

  // calc totals
  const income = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceKes = toKes(balance);
  const incomeKes = toKes(income);
  const expensesKes = toKes(expenses);

  return (
    <div className="balance-section">
      <div className="balance-card">
        <h2>Account Balance</h2>
        <div className={`balance-value ${balance >= 0 ? 'positive' : 'negative'}`}>
          {formatCurrency(balance)}
        </div>
        <div className="balance-kes">
          {loading ? '...' : balanceKes !== null ? formatKes(balanceKes) : '—'}
        </div>
      </div>

      <div className="balance-summary">
        <div className="summary-item">
          <span className="label">Total Income</span>
          <span className="value positive">+{formatCurrency(income)}</span>
          <span className="value-kes">
            {loading ? '...' : incomeKes !== null ? `+${formatKes(incomeKes)}` : '—'}
          </span>
        </div>
        <div className="summary-item">
          <span className="label">Total Expenses</span>
          <span className="value negative">-{formatCurrency(expenses)}</span>
          <span className="value-kes">
            {loading ? '...' : expensesKes !== null ? `-${formatKes(expensesKes)}` : '—'}
          </span>
        </div>
      </div>

      {lastAction && (
        <button className="undo-btn" onClick={undo}>
          Undo Last Action
        </button>
      )}
    </div>
  );
}
