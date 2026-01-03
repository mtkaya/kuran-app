// Settings Store - Theme and Font Sizes
import { create } from 'zustand';
import { UserSettings, DEFAULT_SETTINGS } from '../storage/types';
import { getSettings, saveSettings } from '../storage/storage';

interface SettingsState extends UserSettings {
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setArabicFontSize: (size: number) => void;
    setMealFontSize: (size: number) => void;
    setShowTransliteration: (show: boolean) => void;
    setShowTajweed: (show: boolean) => void;
    hydrate: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    ...DEFAULT_SETTINGS,

    setTheme: (theme) => {
        set({ theme });
        saveSettings({ ...get(), theme });
        applyTheme(theme);
    },

    setArabicFontSize: (arabicFontSize) => {
        set({ arabicFontSize });
        saveSettings({ ...get(), arabicFontSize });
    },

    setMealFontSize: (mealFontSize) => {
        set({ mealFontSize });
        saveSettings({ ...get(), mealFontSize });
    },

    setShowTransliteration: (showTransliteration) => {
        set({ showTransliteration });
        saveSettings({ ...get(), showTransliteration });
    },

    setShowTajweed: (showTajweed) => {
        set({ showTajweed });
        saveSettings({ ...get(), showTajweed });
    },

    hydrate: () => {
        const settings = getSettings();
        set(settings);
        applyTheme(settings.theme);
    },
}));

// Apply theme to document
function applyTheme(theme: 'light' | 'dark' | 'system') {
    const root = document.documentElement;

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
    } else {
        root.classList.toggle('dark', theme === 'dark');
    }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const { theme } = useSettingsStore.getState();
        if (theme === 'system') {
            applyTheme('system');
        }
    });
}
