/**
 * Local SQLite database has been removed.
 * All data is stored in Supabase (PostgreSQL) via the backend API.
 * This file is kept as a no-op stub to avoid breaking any existing imports.
 */

export const initDatabase = async (): Promise<void> => {
  // No-op: data lives in Supabase
};

export const saveTransactions = async (_transactions: any[]): Promise<void> => {
  // No-op: data lives in Supabase
};

export const getAllTransactions = async (): Promise<any[]> => {
  return []; // Not used – fetch from API instead
};

export const getMonthlyTotal = async (
  _year: number,
  _month: number
): Promise<number> => {
  return 0; // Not used – fetch from API instead
};


