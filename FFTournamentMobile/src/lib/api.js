import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const defaultApiUrl = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  default: 'http://127.0.0.1:8000/api',
});

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || defaultApiUrl,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
