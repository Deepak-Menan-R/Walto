import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (phone: string, password: string, email?: string) => {
    const response = await api.post('/api/auth/register', { phone, password, email });
    return response.data;
  },

  login: async (phone: string, password: string) => {
    const response = await api.post('/api/auth/login', { phone, password });

      upgradePlan: async () => {
        const response = await api.post('/api/auth/upgrade');
        return response.data;
      },
    return response.data;
  },
};

export const transactionAPI = {
  parseSMS: async (smsMessages: string[]): Promise<{ transactions: Transaction[] }> => {
    const response = await api.post('/api/parse-sms', {
      sms_messages: smsMessages,
    });
    return response.data;
  },

  getTransactions: async (limit = 100, offset = 0): Promise<{ transactions: Transaction[] }> => {
    const response = await api.get('/api/transactions', {
      params: { limit, offset },
    });
    return response.data;
  },

  getMonthlySummary: async (year: number, month: number) => {
    const response = await api.get('/api/summary', {
      params: { year, month },
    });
    return response.data;
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    const response = await api.put(`/api/transactions/${id}`, updates);
    return response.data;
  },

  deleteTransaction: async (id: string) => {
    const response = await api.delete(`/api/transactions/${id}`);
    return response.data;
  },
};

export default api;
