import React, { useRef, useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { parseCSV, exportToCSV, downloadFile } from '../../utils';
import './CSVManager.css';

type MessageType = { type: 'success' | 'error'; text: string };

export default function CSVManager(): React.ReactElement {
  const { transactions, importTransactions } = useBanking();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<MessageType | null>(null);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const txns = parseCSV(content);

      if (txns.length === 0) {
        setMsg({ type: 'error', text: 'No valid transactions found' });
        return;
      }

      importTransactions(txns);
      setMsg({ type: 'success', text: `Imported ${txns.length} transactions` });
    } catch (err) {
      setMsg({ type: 'error', text: 'Invalid CSV file format' });
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
      {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
    </div>
  );
}
