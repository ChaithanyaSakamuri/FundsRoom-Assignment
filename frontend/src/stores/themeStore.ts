import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

const savedTheme = localStorage.getItem('nexora_theme');

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: savedTheme === 'dark',
  toggle: () => {
    const next = !get().isDark;
    localStorage.setItem('nexora_theme', next ? 'dark' : 'light');
    document.documentElement.dataset.theme = next ? 'dark' : '';
    set({ isDark: next });
  },
}));