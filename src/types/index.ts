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

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  frequency: 'monthly' | 'yearly';
  nextDate: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
}

export interface StackItem {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  category: string;
}

export interface DistributionRule {
  id: string;
  name: string;
  percentage: number;
  destinationAccountId: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  month: string;
}

export interface DigitalTool {
  id: string;
  name: string;
  purpose: string;
  url?: string;
}

export interface AutomationRule {
  id: string;
  trigger: string;
  action: string;
  active: boolean;
}

export interface AppState {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  goals: Goal[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  tags: string[];
  rules: DistributionRule[];
  stack: StackItem[];
  checklist: ChecklistItem[];
  digitalTools: DigitalTool[];
  automations: AutomationRule[];
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
