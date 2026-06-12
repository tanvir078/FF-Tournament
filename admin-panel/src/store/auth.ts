import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  hydrate: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  setUser: (user) => {
    set({ user });
    localStorage.setItem('admin-user', JSON.stringify(user));
  },
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  hydrate: () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('admin-user');

    try {
      set({ token, user: storedUser ? JSON.parse(storedUser) : null, hydrated: true });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('admin-user');
      set({ token: null, user: null, hydrated: true });
    }
  },
  logout: () => {
    set({ user: null, token: null, hydrated: true });
    localStorage.removeItem('token');
    localStorage.removeItem('admin-user');
  },
}));
