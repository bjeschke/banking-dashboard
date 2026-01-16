import React, { useRef, useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { parseCSV, exportToCSV, downloadFile } from '../../utils';
import './CSVManager.css';

interface Message {
  type: 'success' | 'error' | 'warning';
  text: string;
  details?: string[];
}

export default function CSVManager(): React.ReactElement {
  const { transactions, importTransactions } = useBanking();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<Message | null>(null);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    const { transactions: txns, errors } = parseCSV(content);

    if (txns.length === 0 && errors.length > 0) {
      setMsg({
        type: 'error',
        text: 'No valid transactions found',
        details: errors.slice(0, 5),
      });
    } else if (txns.length === 0) {
      setMsg({ type: 'error', text: 'No valid transactions found in CSV file' });
    } else if (errors.length > 0) {
      importTransactions(txns);
      setMsg({
        type: 'warning',
        text: `Imported ${txns.length} transactions (${errors.length} rows skipped)`,
        details: errors.slice(0, 5),
      });
    } else {
      importTransactions(txns);
      setMsg({ type: 'success', text: `Imported ${txns.length} transactions` });
    }

    // reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleExport() {
    if (transactions.length === 0) {
      setMsg({ type: 'error', text: 'No transactions to export' });
      return;
    }

    const csv = exportToCSV(transactions);
    const filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadFile(csv, filename);
    setMsg({ type: 'success', text: 'Exported successfully' });
  }

  return (
    <div className="csv-manager">
      <h3>Import / Export</h3>
      <div className="buttons">
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current?.click()}>
          Import CSV
        </button>
        <button onClick={handleExport}>Export CSV</button>
      </div>
      {msg && (
        <div className={`message ${msg.type}`}>
          <span>{msg.text}</span>
          {msg.details && msg.details.length > 0 && (
            <ul className="message-details">
              {msg.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
