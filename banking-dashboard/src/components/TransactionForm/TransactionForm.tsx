import React, { useState, useEffect } from 'react';
import { useBanking } from '../../context/BankingContext';
import { Transaction, TransactionType } from '../../types';
import { generateId, getTodayDate } from '../../utils';
import './TransactionForm.css';

export default function TransactionForm(): React.ReactElement {
  const {
    addTransaction,
    updateTransaction,
    editingTransaction,
    reuseTransaction,
    setEditingTransaction,
    setReuseTransaction
  } = useBanking();

  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayDate());
  const [error, setError] = useState('');

  const isEditing = !!editingTransaction;

  // populate form when editing or reusing a transaction
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
      setIsOpen(true);
    } else if (reuseTransaction) {
      setType(reuseTransaction.type);
      setAmount(String(reuseTransaction.amount));
      setDescription(reuseTransaction.description);
      setDate(getTodayDate()); // use today for reused transactions
      setIsOpen(true);
    }
  }, [editingTransaction, reuseTransaction]);

  function reset() {
    setType('deposit');
    setAmount('');
    setDescription('');
    setDate(getTodayDate());
    setError('');
    setIsOpen(false);
    setEditingTransaction(null);
    setReuseTransaction(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    const txn: Transaction = {
      id: isEditing ? editingTransaction!.id : generateId(),
      type,
      amount: amt,
      description: description.trim(),
      date,
    };

    const err = isEditing ? updateTransaction(txn) : addTransaction(txn);
    if (err) {
      setError(err);
      return;
    }

    reset();
  }

  if (!isOpen) {
    return (
      <button className="add-btn" onClick={() => setIsOpen(true)}>
        New Transaction
      </button>
    );
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h3>{isEditing ? 'Edit Transaction' : 'New Transaction'}</h3>

      {error && <div className="error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="txn-type">Type</label>
          <select
            id="txn-type"
            value={type}
            onChange={e => setType(e.target.value as TransactionType)}
          >
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="txn-amount">Amount (EUR)</label>
          <input
            id="txn-amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="txn-date">Date</label>
        <input
          id="txn-date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="txn-description">Description</label>
        <input
          id="txn-description"
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g., Salary, Grocery Shopping"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={reset}>
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          {isEditing ? 'Save' : 'Add'}
        </button>
      </div>
    </form>
  );
}
