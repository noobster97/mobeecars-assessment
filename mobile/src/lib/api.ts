import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export const TOKEN_KEY = 'mobeecars_token';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 10_000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
