import React from 'react';
import Balance from '../Balance';
import TransactionForm from '../TransactionForm';
import TransactionList from '../TransactionList';
import CSVManager from '../CSVManager';
import ThemeToggle from '../ThemeToggle';
import './Dashboard.css';

export default function Dashboard(): React.ReactElement {
  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <h1>Banking Dashboard</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="content">
        <aside className="sidebar">
          <Balance />
          <TransactionForm />
          <CSVManager />
        </aside>
        <section className="main">
          <TransactionList />
        </section>
      </main>

      <footer className="footer"></footer>
    </div>
  );
}
