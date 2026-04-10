import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './api';

export const login = async (phone: string, password: string) => {
  const response = await authAPI.login(phone, password);
  await AsyncStorage.setItem('authToken', response.token);
  await AsyncStorage.setItem('user', JSON.stringify(response.user));
  return response;
};

export const register = async (phone: string, password: string, email?: string) => {
  const response = await authAPI.register(phone, password, email);
  await AsyncStorage.setItem('authToken', response.token);
  await AsyncStorage.setItem('user', JSON.stringify(response.user));
  return response;
};

export const logout = async () => {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
};

export const getStoredUser = async () => {
  const userStr = await AsyncStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return !!token;
};
