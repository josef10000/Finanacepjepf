export type TransactionType = 'receita' | 'despesa' | 'transfer';
export type AccountType = 'operational' | 'goal_pot' | 'wallet' | 'credit_card';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  pending?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  limit?: number;
  closingDay?: number;
  dueDay?: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  dre?: string;
  sub?: string;
}

export interface AppState {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  goals: any[];
  budgets: any[];
  recurring: any[];
  tags: string[];
  rules: any[];
  stack: any[];
  checklist: any[];
  launchEvents: any[];
  capTable: any[];
  taxRate: number;
  warRate: number;
  checklistMonth: string;
}

export interface DBState {
  PJ: AppState;
  PF: AppState;
}
