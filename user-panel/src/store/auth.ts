import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  ign?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
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
    }
  },
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },
}));
