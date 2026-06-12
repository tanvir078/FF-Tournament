import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  ign?: string;
  platformHandle?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setAuth: (user: User, token: string) => void;
  hydrate: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  setAuth: (user, token) => {
    set({ user, token });
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  hydrate: () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    try {
      set({ token, user: storedUser ? JSON.parse(storedUser) : null, hydrated: true });
    } catch {
      localStorage.removeItem('user');
      set({ token: null, user: null, hydrated: true });
    }
  },
  logout: () => {
    set({ user: null, token: null, hydrated: true });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
}));
