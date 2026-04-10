import { create } from 'zustand';
import type { User, Subscription } from '../types';
import { auth as authApi, saveToken, clearToken } from '../services/api';

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<{ user: User; subscription: Subscription | null }>;
  register: (email: string, password: string, nombre?: string) => Promise<User>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setSubscription: (sub: Subscription | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  subscription: null,
  loading: false,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await authApi.login(email, password);
      saveToken(res.token);
      set({ user: res.user, subscription: res.subscription, loading: false });
      return { user: res.user, subscription: res.subscription };
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  register: async (email, password, nombre) => {
    set({ loading: true });
    try {
      const res = await authApi.register(email, password, nombre);
      saveToken(res.token);
      set({ user: res.user, loading: false });
      return res.user;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: () => {
    clearToken();
    set({ user: null, subscription: null });
  },

  fetchMe: async () => {
    set({ loading: true });
    try {
      const res = await authApi.me();
      const { subscription, ...user } = res;
      set({ user, subscription, loading: false, initialized: true });
    } catch {
      set({ user: null, subscription: null, loading: false, initialized: true });
    }
  },

  setSubscription: (sub) => set({ subscription: sub }),
}));

if (import.meta.env.DEV) {
  (window as unknown as Window & { __authStore: typeof useAuthStore }).__authStore = useAuthStore;
}
