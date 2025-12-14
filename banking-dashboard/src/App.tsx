import React from 'react';
import { BankingProvider } from './context/BankingContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './components/Dashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BankingProvider>
        <Dashboard />
      </BankingProvider>
    </ThemeProvider>
  );
};

export default App;
