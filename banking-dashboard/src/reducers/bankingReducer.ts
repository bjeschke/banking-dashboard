import { Transaction, TransactionFilter } from '../types';

export interface BankingState {
  balance: number;
  transactions: Transaction[];
  filter: TransactionFilter;
  currentPage: number;
  lastAction: LastAction | null;
  editingTransaction: Transaction | null;
  reuseTransaction: Transaction | null;
}

export interface LastAction {
  type: 'add' | 'delete' | 'edit';
  transaction: Transaction;
  prevBalance: number;
  oldTransaction?: Transaction;
}

export type BankingAction =
  | { type: 'ADD_TRANSACTION'; payload: { transaction: Transaction; delta: number } }
  | { type: 'DELETE_TRANSACTION'; payload: { id: string } }
  | { type: 'UPDATE_TRANSACTION'; payload: { transaction: Transaction; newBalance: number; oldTransaction: Transaction } }
  | { type: 'UNDO' }
  | { type: 'SET_FILTER'; payload: Partial<TransactionFilter> }
  | { type: 'RESET_FILTER' }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_EDITING'; payload: Transaction | null }
  | { type: 'SET_REUSE'; payload: Transaction | null }
  | { type: 'IMPORT_TRANSACTIONS'; payload: { transactions: Transaction[]; delta: number } }
  | { type: 'LOAD_SAVED'; payload: { balance: number; transactions: Transaction[] } };

export const defaultFilter: TransactionFilter = {
  type: 'all',
  dateFrom: '',
  dateTo: '',
  searchTerm: '',
};

export function bankingReducer(state: BankingState, action: BankingAction): BankingState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        balance: state.balance + action.payload.delta,
        transactions: [action.payload.transaction, ...state.transactions],
        lastAction: {
          type: 'add',
          transaction: action.payload.transaction,
          prevBalance: state.balance,
        },
        currentPage: 1,
      };

    case 'DELETE_TRANSACTION': {
      const transaction = state.transactions.find(t => t.id === action.payload.id);
      if (!transaction) return state;

      const delta = transaction.type === 'deposit' ? -transaction.amount : transaction.amount;
      return {
        ...state,
        balance: state.balance + delta,
        transactions: state.transactions.filter(t => t.id !== action.payload.id),
        lastAction: {
          type: 'delete',
          transaction,
          prevBalance: state.balance,
        },
      };
    }

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        balance: action.payload.newBalance,
        transactions: state.transactions.map(t =>
          t.id === action.payload.transaction.id ? action.payload.transaction : t
        ),
        lastAction: {
          type: 'edit',
          transaction: action.payload.transaction,
          oldTransaction: action.payload.oldTransaction,
          prevBalance: state.balance,
        },
        editingTransaction: null,
      };

    case 'UNDO': {
      if (!state.lastAction) return state;

      const { type, transaction, prevBalance, oldTransaction } = state.lastAction;

      let newTransactions = state.transactions;
      if (type === 'add') {
        newTransactions = state.transactions.filter(t => t.id !== transaction.id);
      } else if (type === 'delete') {
        newTransactions = [transaction, ...state.transactions];
      } else if (type === 'edit' && oldTransaction) {
        newTransactions = state.transactions.map(t =>
          t.id === oldTransaction.id ? oldTransaction : t
        );
      }

      return {
        ...state,
        balance: prevBalance,
        transactions: newTransactions,
        lastAction: null,
      };
    }

    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
        currentPage: 1,
      };

    case 'RESET_FILTER':
      return {
        ...state,
        filter: defaultFilter,
        currentPage: 1,
      };

    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      };

    case 'SET_EDITING':
      return {
        ...state,
        editingTransaction: action.payload,
      };

    case 'SET_REUSE':
      return {
        ...state,
        reuseTransaction: action.payload,
      };

    case 'IMPORT_TRANSACTIONS':
      return {
        ...state,
        balance: state.balance + action.payload.delta,
        transactions: [...action.payload.transactions, ...state.transactions],
        lastAction: null,
        currentPage: 1,
      };

    case 'LOAD_SAVED':
      return {
        ...state,
        balance: action.payload.balance,
        transactions: action.payload.transactions,
      };

    default:
      return state;
  }
}
