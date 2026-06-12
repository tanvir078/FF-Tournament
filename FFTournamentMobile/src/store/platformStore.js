import { create } from 'zustand';
import api from '../lib/api';

const defaults = { brandName: 'ArenaHub', primaryColor: '#38bdf8', secondaryColor: '#7c3aed' };

export const usePlatformStore = create((set) => ({
  settings: defaults,
  load: async () => {
    try {
      const { data } = await api.get('/platform/settings');
      set({ settings: { ...defaults, ...data } });
    } catch {
      set({ settings: defaults });
    }
  },
}));
