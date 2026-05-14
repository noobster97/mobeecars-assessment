import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import api, { TOKEN_KEY } from '@/src/lib/api';
import { clearUserData } from '@/src/lib/db';

const USER_KEY = 'mobeecars_user';

export type User = {
  id: number;
  name: string;
  email: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: async () => {
    const [token, userJson] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);
    set({
      token,
      user: userJson ? (JSON.parse(userJson) as User) : null,
      hydrated: true,
    });
  },

  login: async (email, password) => {
    const { data } = await api.post<{ user: User; token: string }>(
      '/auth/login',
      { email, password },
    );
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, data.token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user)),
    ]);
    set({ token: data.token, user: data.user });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // network failure on logout is fine — local clear is what matters
    }
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      clearUserData(),
    ]);
    set({ token: null, user: null });
  },
}));
