import { create } from 'zustand';
import { Transaction, User, UserPlan } from '../types';

interface AppState {
  user: User | null;
  plan: UserPlan;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  plan: 'free',
  transactions: [],
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, plan: user?.plan ?? 'free' }),
  setTransactions: (transactions) => set({ transactions }),
  addTransactions: (newTransactions) =>
    set((state) => ({
      transactions: [...newTransactions, ...state.transactions],
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
