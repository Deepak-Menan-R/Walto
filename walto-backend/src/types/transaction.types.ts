export type TransactionType = 'debit' | 'credit';

export type ParseStatus = 'regex_parsed' | 'needs_llm' | 'llm_parsed';

export type UserPlan = 'free' | 'premium';

export type TransactionCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Shopping'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Travel'
  | 'Education'
  | 'Investments'
  | 'Others';

export type PaymentMode =
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Net Banking'
  | 'Wallet'
  | 'NEFT'
  | 'IMPS'
  | 'RTGS'
  | 'Auto Debit'
  | 'Cash'
  | 'Unknown';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  merchant: string;
  category: TransactionCategory;
  date: string;
  mode: PaymentMode;
  confidence: number;
  parse_status: ParseStatus;
  txn_id?: string;
  account_last4?: string;
  balance_after?: number;
  raw_sms: string;
  is_edited: boolean;
  is_ignored: boolean;
  created_at: string;
}

export interface ParsedTransaction {
  amount: number;
  currency: string;
  type: TransactionType;
  merchant: string;
  category: TransactionCategory;
  date: string;
  mode: PaymentMode;
  confidence: number;
  parse_status: ParseStatus;
  txn_id?: string;
  account_last4?: string;
  balance_after?: number;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  plan: UserPlan;
  created_at: string;
}

export interface PendingLLMQueue {
  id: string;
  user_id: string;
  raw_sms: string;
  created_at: string;
}
