import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BankingProvider } from './context/BankingContext';
import { ThemeProvider } from './context/ThemeContext';

interface WrapperProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: WrapperProps) => {
  return (
    <ThemeProvider>
      <BankingProvider>
        {children}
      </BankingProvider>
    </ThemeProvider>
  );
};

const BankingOnlyProvider = ({ children }: WrapperProps) => {
  return (
    <BankingProvider>
      {children}
    </BankingProvider>
  );
};

const ThemeOnlyProvider = ({ children }: WrapperProps) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

const renderWithBanking = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: BankingOnlyProvider, ...options });

const renderWithTheme = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: ThemeOnlyProvider, ...options });

export * from '@testing-library/react';
export { customRender as render, renderWithBanking, renderWithTheme };
