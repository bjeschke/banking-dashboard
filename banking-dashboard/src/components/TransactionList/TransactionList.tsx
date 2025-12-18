import React from 'react';
import { useBanking } from '../../context/BankingContext';
import { formatCurrency, formatDate, filterTransactions, sortByDate } from '../../utils';
import { useExchangeRate, formatKes } from '../../services/exchangeRate';
import { TransactionType } from '../../types';
import './TransactionList.css';

const PAGE_SIZE = 20;

export default function TransactionList(): React.ReactElement {
  const {
    transactions,
    filter,
    currentPage,
    setFilter,
    resetFilter,
    setPage,
    deleteTransaction,
    setEditingTransaction,
    setReuseTransaction
  } = useBanking();

  const { toKes } = useExchangeRate();

  const filtered = sortByDate(filterTransactions(transactions, filter));
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="transaction-list-section">
      <div className="header">
        <h2>Transactions</h2>
        <span className="count">{filtered.length} entries</span>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filter.searchTerm}
          onChange={e => setFilter({ searchTerm: e.target.value })}
        />
        <select
          value={filter.type}
          onChange={e => setFilter({ type: e.target.value as TransactionType | 'all' })}
        >
          <option value="all">All</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
        </select>
        <div className="date-filters">
          <div className="date-filter-row">
            <label>From:</label>
            <input
              type="date"
              value={filter.dateFrom}
              onChange={e => setFilter({ dateFrom: e.target.value })}
            />
          </div>
          <div className="date-filter-row">
            <label>To:</label>
            <input
              type="date"
              value={filter.dateTo}
              onChange={e => setFilter({ dateTo: e.target.value })}
            />
          </div>
        </div>
        <button onClick={resetFilter}>Reset</button>
      </div>

      <div className="list">
        {visible.length === 0 ? (
          <div className="empty">No transactions found</div>
        ) : (
          visible.map(t => (
            <div key={t.id} className={`item ${t.type}`}>
              <div className="icon">{t.type === 'deposit' ? '↓' : '↑'}</div>
              <div className="details">
                <span className="description">{t.description}</span>
                <span className="meta">
                  {t.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </span>
              </div>
              <div className="amount-col">
                <span className={`amount ${t.type === 'deposit' ? 'positive' : 'negative'}`}>
                  {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <span className="amount-kes">
                  {toKes(t.amount) !== null
                    ? `${t.type === 'deposit' ? '+' : '-'}${formatKes(toKes(t.amount)!)}`
                    : '—'}
                </span>
                <span className="date">{formatDate(t.date)}</span>
              </div>
              <div className="actions">
                <button onClick={() => setEditingTransaction(t)}>Edit</button>
                <button onClick={() => setReuseTransaction(t)}>Reuse</button>
                <button onClick={() => deleteTransaction(t.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {pageCount > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Prev
          </button>
          <span>{currentPage} / {pageCount}</span>
          <button
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
