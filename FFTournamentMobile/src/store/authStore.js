import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  hydrated: false,

  bootstrap: async () => {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) {
      set({ hydrated: true });
      return;
    }

    try {
      const { data } = await api.get('/auth/profile');
      set({ user: data, hydrated: true });
    } catch {
      await SecureStore.deleteItemAsync('access_token');
      set({ user: null, hydrated: true });
    }
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    await SecureStore.setItemAsync('access_token', data.access_token);
    set({ user: data.user });
  },

  register: async (form) => {
    await api.post('/auth/register', form);
    const { data } = await api.post('/auth/login', {
      email: form.email,
      password: form.password,
    });
    await SecureStore.setItemAsync('access_token', data.access_token);
    set({ user: data.user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    set({ user: null });
  },
}));
